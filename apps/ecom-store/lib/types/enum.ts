// enums
export enum Role {
  ADMIN = 'ADMIN',
  ATHLETE = 'ATHLETE',
  NUTRITIONIST = 'NUTRITIONIST',
  COACH = 'COACH',
}

export enum Gender {
  MEN = 'MEN',
  WOMEN = 'WOMEN',
  UNISEX = 'UNISEX',
}

export enum Size {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  //PAID = 'PAID',
  //PROCESSING = 'PROCESSING',
  //SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}
