export interface Category {
  name: string;
  subcategories?: Category[];
  values: { [month: string]: number };
}
