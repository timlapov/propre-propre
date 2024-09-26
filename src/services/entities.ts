// Represents a category of items
export interface ICategory {
  id: number;
  name: string;
}

// Represents a city with an associated country
export interface ICity {
  id: number;
  name: string;
  country: ICountry;
}

// Represents a client in the system
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
  roles: string[];
}

// Represents a country
export interface ICountry {
  id: number;
  name: string;
}

// Represents an employee
export interface IEmployee {
  id: number;
  email: string;
  roles: string[];
  name: string;
  surname: string;
  phoneNumber: string;
  orders: IOrder[];
}

// Represents a gender
export interface IGender {
  id: number;
  name: string;
}

// Represents an item in an order
export interface IItem {
  id: number;
  order_: string;
  ironing: boolean;
  perfuming: boolean;
  subcategory: ISubcategory;
  service: IService;
  quantity: number;
}

// Represents an order made by a client
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
  paymentMethod: 'cash' | 'card';
}

// Represents the status of an order
export interface IOrderStatus {
  id: number;
  name: string;
  description: string;
}

// Represents a service offered
export interface IService {
  id: number;
  name: string;
  description: string | null;
  price: number;
}

// Represents a subcategory of items
export interface ISubcategory {
  id: number;
  name: string;
  price_coefficient: number;
  category: string;
  imageUrl: string;
  '@id': string;
  '@type': string;
}

// Represents an item in the shopping cart
export interface CartItem {
  subcategory: ISubcategory;
  ironing: boolean;
  perfuming: boolean;
  quantity: number;
  serviceId: number;
}

// Represents service coefficients for pricing
export interface ICoefficients {
  id: number;
  expressCoefficient: number;
  ironingCoefficient: number;
  perfumingCoefficient: number;
}

