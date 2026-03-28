const EmptyColumn = () => {
  return (
    <div className="rounded-md border">
      <div className="p-10 block">
        <p className="text-sm text-muted-foreground text-center">
          No column available for mapping. To get started, please upload a file
          or add your first row.
        </p>
      </div>
    </div>
  );
};

export { EmptyColumn };
