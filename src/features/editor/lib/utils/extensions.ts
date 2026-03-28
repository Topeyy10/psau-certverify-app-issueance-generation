import { classRegistry, FabricObject, Path } from "fabric";
import QRCodeSVG from "qrcode-svg";

const ECLMap = {
  Quartile: "Q",
  Low: "L",
  Medium: "M",
  High: "H",
} as const;

interface UniqueQRProps {
  text: string;
  ecl: keyof typeof ECLMap;
  margin: number;
  fill: string;
  backgroundColor: string;
}

interface QRProps
  extends Omit<FabricObject, "fill" | "backgroundColor">,
    UniqueQRProps {}

class QRCode extends FabricObject implements UniqueQRProps {
  static type = "Qrcode";

  static ownDefaults: UniqueQRProps = {
    text: "Example",
    ecl: "Low",
    margin: 1,
    fill: "#000000",
    backgroundColor: "#FFFFFF",
  };

  public text: string = QRCode.ownDefaults.text;
  public ecl: keyof typeof ECLMap = QRCode.ownDefaults.ecl;
  public margin: number = QRCode.ownDefaults.margin;
  public fill: string = QRCode.ownDefaults.fill;
  public backgroundColor: string = QRCode.ownDefaults.backgroundColor;

  private qrPath: Path | null = null;

  constructor(text?: string, options: Partial<QRProps> = {}) {
    const merged: UniqueQRProps & Partial<QRProps> = {
      ...QRCode.ownDefaults,
      ...options,
    };

    if (text) {
      merged.text = text.trim();
    }

    super(merged);

    this.text = merged.text;
    this.ecl = merged.ecl;
    this.margin = merged.margin;
    this.fill = merged.fill;
    this.backgroundColor = merged.backgroundColor;

    this._generate();
  }

  static getDefaults() {
    return {
      ...FabricObject.getDefaults(),
      ...QRCode.ownDefaults,
    };
  }

  static async fromObject(object: any): Promise<QRCode> {
    return new QRCode(object.text, object);
  }

  private _generate() {
    const ecl = ECLMap[this.ecl];

    const qr = new QRCodeSVG({
      background: this.backgroundColor,
      color: this.fill,
      container: "svg-viewbox",
      content: this.text,
      ecl,
      height: this.width,
      join: true,
      padding: this.margin,
      width: this.width,
    });

    const match = qr.svg().match(/d="([^"]+)"/);
    this.qrPath = match
      ? new Path(match[1], {
          left: -this.width / 2,
          top: -this.height / 2,
          fill: this.fill,
          originX: "left",
          originY: "top",
        })
      : null;
  }

  override set<K extends keyof this>(key: K, value: this[K]): this;
  override set(options: Partial<this>): this;
  override set(keyOrOptions: any, value?: any): this {
    super.set(keyOrOptions as any, value);

    const props =
      typeof keyOrOptions === "string"
        ? { [keyOrOptions]: value }
        : keyOrOptions;

    if (
      props.text !== undefined ||
      props.margin !== undefined ||
      props.ecl !== undefined ||
      props.fill !== undefined ||
      props.backgroundColor !== undefined ||
      props.width !== undefined ||
      props.height !== undefined
    ) {
      if (this.width > 0 && this.height > 0) {
        this._generate();
        this.setCoords();
        this.dirty = true;
      }
    }

    return this;
  }

  _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    if (this.qrPath) {
      this.qrPath._render(ctx);
    }
  }

  toObject(propertiesToInclude: string[] = []) {
    return {
      ...super.toObject(propertiesToInclude),
      text: this.text,
      ecl: this.ecl,
      margin: this.margin,
      fill: this.fill,
      backgroundColor: this.backgroundColor,
    };
  }
}

classRegistry.setClass(QRCode);
export { QRCode, type QRProps };
