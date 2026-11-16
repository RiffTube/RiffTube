import { twMerge } from 'tailwind-merge';

export type InlineLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

function InlineLink({ className = '', ...props }: InlineLinkProps) {
  const base =
    'cursor-pointer text-sm text-popcorn-butter underline hover:underline';

  const classes = twMerge(base, className);

  return <a {...props} className={classes} />;
}

export default InlineLink;
