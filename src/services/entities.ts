export interface IAdditionalService {
  id: number;
  name: string;
  priceCoefficient: number;
}

export interface ICategory {
  id: number;
  name: string;
}

export interface ICity {
  id: number;
  name: string;
  country: ICountry;
}

export interface IClient {
  id: number;
  email: string;
  name: string;
  surname: string;
  birthdate?: Date | null;
  address: string;
  city: ICity | null;
  gender: IGender | null;
  password: string;
  orders: IOrder[];
}

export interface ICountry {
  id: number;
  name: string;
}

export interface IEmployee {
  id: number;
  email: string;
  roles: string[];
  name: string;
  surname: string;
  phoneNumber: string;
  orders: IOrder[];
}

export interface IGender {
  id: number;
  name: string;
}

export interface IItem {
  id: number;
  order_: string;
  ironing: boolean;
  perfuming: boolean;
  subcategory: ISubcategory;
  service: IService;
}

export interface IOrder {
  id: number;
  express: boolean;
  orderStatus: IOrderStatus;
  created: Date;
  completed: Date | null;
  client: IClient;
  employee: IEmployee | null;
  items: IItem[];
  totalPrice: number;
}

export interface IOrderStatus {
  id: number;
  name: string;
}

export interface IService {
  id: number;
  name: string;
  description: string | null;
  price: number;
}

export interface ISubcategory {
  id: number;
  name: string;
  price_coefficient: number;
  category: string;
  imageUrl: string;
  '@id': string;
  '@type': string;
}
