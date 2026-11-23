export interface CardProps {
  number: number;
  title: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}

/** One step in the "How It Works" listing: a column of the printed guide. */
function Card({ number, title, Icon, children }: CardProps) {
  return (
    <div className="min-w-0">
      <div className="flex h-11 items-center justify-between">
        <span className="font-serif text-[34px] leading-none text-burgundy">
          {number}
        </span>
        <span className="grid h-11 w-11 place-items-center">
          <Icon aria-hidden="true" className="h-9 w-auto text-ink" />
        </span>
      </div>
      <h3 className="mt-5 text-[21px] leading-7 font-bold">{title}</h3>
      <p className="mt-2 max-w-[34ch] text-[17px] leading-relaxed text-muted-light">
        {children}
      </p>
    </div>
  );
}

export default Card;
