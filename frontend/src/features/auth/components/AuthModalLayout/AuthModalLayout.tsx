export type AuthModalLayoutProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function AuthModalLayout({ title, children, footer }: AuthModalLayoutProps) {
  return (
    <>
      <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>
      {children}
      {footer && (
        <div className="mt-6 text-center text-sm text-gray-400">{footer}</div>
      )}
    </>
  );
}

export default AuthModalLayout;
