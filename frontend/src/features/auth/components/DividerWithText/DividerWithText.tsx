export type DividerWithTextProps = {
  children: React.ReactNode;
};

export function DividerWithText({ children }: DividerWithTextProps) {
  return (
    <div className="my-6 flex items-center">
      <hr className="flex-grow border-gray-600" />
      <span className="px-4 text-sm text-gray-400">{children}</span>
      <hr className="flex-grow border-gray-600" />
    </div>
  );
}

export default DividerWithText;
