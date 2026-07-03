import peopleData from "../../content/people.json";

export type Person = {
  slug: string;
  name: string;
  role: string;
  github: string;
  summary: string;
  color: string;
};

export const people = peopleData as Person[];

export function getPerson(slug: string): Person | undefined {
  return people.find((p) => p.slug === slug);
}
