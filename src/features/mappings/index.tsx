"use client";

import { memo } from "react";
import {
  Columns,
  DataInput,
  DataTable,
  MetaMappings,
  PlaceholderMappings,
  Preview,
} from "./components";
import { ResetMappings } from "./components/actions";
import { DataProvider, useData } from "./lib/contexts/data-provider";

const Mappings = memo(() => {
  const { state } = useData();

  if (state.loading) return <div>Loading template...</div>;
  if (state.error) return <div>Error: {state.error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <div className="lg:col-span-4 space-y-6">
        <DataInput />
        <DataTable />
        <Columns />
        <PlaceholderMappings />
        <MetaMappings />
        <ResetMappings />
      </div>
      <div className="lg:col-span-2 order-first lg:order-last">
        <div className="lg:sticky lg:top-8">
          <Preview />
        </div>
      </div>
    </div>
  );
});

const ClientMappings = ({ id }: { id: string }) => {
  return (
    <DataProvider id={id}>
      <Mappings />
    </DataProvider>
  );
};

export * from "./lib/constants/generation";
export { ClientMappings as MappingsPage };
