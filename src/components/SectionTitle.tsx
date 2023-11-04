import { ReactNode } from 'react'

const SectionTitle = ({ children }: { children: ReactNode }) => {
  return <h1 className="text-xl font-semibold text-gray-800">{children}</h1>;
};

export default SectionTitle