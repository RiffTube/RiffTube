import { DialogTitle } from '@headlessui/react';

export type AuthModalLayoutProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function AuthModalLayout({ title, children, footer }: AuthModalLayoutProps) {
  return (
    <>
      <DialogTitle as="h2" className="mb-6 pr-10 text-2xl font-bold text-paper">
        {title}
      </DialogTitle>
      {children}
      {footer && (
        <div className="mt-6 text-center text-sm text-muted-dark">{footer}</div>
      )}
    </>
  );
}

export default AuthModalLayout;
