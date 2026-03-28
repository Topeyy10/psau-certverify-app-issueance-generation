import { ObjectTypeBadge } from "../../../indicators/object-badge";

const PropertyHeader = () => {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-background z-1">
      <p className="text-lg leading-none font-medium">Properties</p>
      <ObjectTypeBadge />
    </div>
  );
};

export { PropertyHeader };
