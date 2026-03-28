import {
  AlignmentControls,
  DistributeSettings,
  GroupSettings,
  ImageSettings,
  LayerControls,
  PlaceholderSettings,
  PositionSizeControls,
  PropertyHeader,
  QRCodeSettings,
  ShapeSettings,
  TextSettings,
} from "./settings";

const ObjectProperties = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <PropertyHeader />
      <AlignmentControls />
      <DistributeSettings />
      <LayerControls />
      <DistributeSettings />
      <GroupSettings />
      <PositionSizeControls />
      <ShapeSettings />
      <TextSettings />
      <ImageSettings />
      <PlaceholderSettings />
      <QRCodeSettings />
    </div>
  );
};

export { ObjectProperties };
