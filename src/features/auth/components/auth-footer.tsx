import Link from "next/link";

const AuthFooter = (props: {
  text: string;
  linkHref: string;
  linkText: string;
}) => {
  const { text, linkHref, linkText } = props;
  return (
    <nav className="text-muted-foreground text-sm">
      <p>
        {text}{" "}
        <Link href={linkHref} className="hover:underline">
          {linkText}
        </Link>
      </p>
    </nav>
  );
};

export { AuthFooter };
