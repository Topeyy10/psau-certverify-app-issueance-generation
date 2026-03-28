import { MappingsPage } from "@/features/mappings";

const Mappings = async ({ params }: { params: Promise<{ id?: string }> }) => {
  const { id } = await params;
  if (!id) return null;

  return <MappingsPage id={id} />;
};

export default Mappings;
