export interface CardProps {
  number: number;
  title: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}

function Card({ number, title, Icon, children }: CardProps) {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-lg border-4 border-backstage bg-flicker-white p-6 text-center">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-backstage font-semibold text-white">
          {number}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <Icon aria-hidden="true" className="mb-4 h-12 w-12" />
      <p className="text-base">{children}</p>
    </div>
  );
}

export default Card;
