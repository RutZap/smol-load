export interface Service {
  ServiceIds: ServiceIds;
  ServiceName?: string;
  ServiceDesc?: string;
  ServiceProviderName?: string;
  ServiceCountryCodes?: ServiceCountryCodes;
  AllowableDimensions?: AllowableDimensions;
  MultiPackages?: boolean;
  TimedService?: boolean;
  WeekendService?: boolean;
  BusinessAddresses?: boolean;
  ResidentialAddresses?: boolean;
  ServiceOutOfArea?: boolean;
  DeliveryExpectation?: any; // Unused?
  AvailableEnhancements?: any; // Unused?
  AvailableLabelSpec?: AvailableLabelSpec;
}

export interface ServiceIds {
  ServiceId: number;
  ServiceCustomerUID: number;
  ServiceProviderId: number;
}

export interface ServiceCountryCodes {
  ServiceCountryCode: string[] | string;
}

export interface AllowableDimensions {
  MinWeight: number;
  MaxWeight: number;
  MinVolume: number;
  MaxVolume: number;
  MaxLength: number;
  MaxGirth: number;
}

export interface AvailableLabelSpec {
  LabelSpec: LabelSpec[];
}

export interface LabelSpec {
  LabelSize: '4' | '6' | '8';
  LabelFormat: 'ZPL' | 'EPL' | 'PNG' | 'PDF' | 'JPG' | 'NONE';
}

export interface WhistlGetServicesResponse {
  ServiceList: {
    Service: Service[];
  };
}

export interface Shipment {
  Account: string;
  ServiceInfo: ServiceIds;
  ParcelhubShipmentId?: number;
  CollectionDetails?: CollectionDetails;
  DeliverToStoreOrLockerID?: string;
  CollectionAddress: Address;
  DeliveryAddress: Address;
  Reference1: string;
  Reference2?: string;
  SpecialInstructions?: string;
  ContentsDescription: string;
  Packages: { Package: Package | Package[] };
  Enhancements?: any; // Unused?
  ModifiedTime?: string;
  CurrencyCode?: string;
  CustomsDeclarationInfo?: ShipmentCustomsInfo;
  Deleted?: string; // Deprecated
  HasBeenManifested?: boolean;
  ShipmentTags?: string[];
  Stream?: string;
  Department: string;
  ProductTypeCode?: string;
}

export interface CollectionDetails {
  CollectionDate: string;
  CollectionReadyTime: string;
  LocationCloseTime: string;
}

export interface Address {
  ContactName: string;
  CompanyName?: string;
  Email?: string;
  Phone?: string;
  Address1: string;
  Address2?: string;
  City: string;
  Area?: string;
  Postcode: string;
  Country: string;
  AddressType?: 'Residential' | 'Business' | 'Parcelshop';
}

export interface Package {
  PackageShippingInfo?: PackageShippingInfo;
  PackageCustomsDeclaration?: PackageCustomsDeclaration;
  PackageType: string;
  Dimensions: Dimensions;
  Weight: number;
  Value: number;
  Contents: string;
  ItemLevelDeclarations: { ItemLevelDeclaration: ItemLevelDeclaration | ItemLevelDeclaration[] };
}

export interface PackageShippingInfo {
  Labels?: { Label: Label | Label[] };
  CourierTrackingNumber: string;
}

export interface PackageCustomsDeclaration {
  ContentsDescription: string;
  Quantity: number;
  Weight: number;
  Value: number;
  HSTariffNumber: string;
  CountryOfOrigin: string;
}

export interface Dimensions {
  Length: number;
  Width: number;
  Height: number;
}

export interface Label {
  LabelData: string;
  LabelSize: number;
  LabelFormat: string;
  // RawLabelData?: RawLabelData; >> From whistl: Shows data that exists on the label. Can be ignored as data is available elsewhere in shipment object.
  Printed: boolean;
}

export interface ItemLevelDeclaration {
  ProductSKU?: string;
  ProductDescription?: string;
  ProductType: string;
  ProductValue: number;
  ProductQuantity: number;
  ProductWeight: number;
  ProductCountryOfOrigin: string;
  ProductHarmonisedCode: string;
}

export interface ShipmentCustomsInfo {
  TermsOfTrade: string;
  SendersCustomsReference?: string;
  ImportersReference?: string;
  ImportersContactDetails?: string;
  PostalCharges?: number;
  CategoryOfItem: string;
  CategoryOfItemExplanation?: string;
  Comments?: string;
  LicenseNumber?: string;
  CertificateNumber?: string;
  InvoiceNumber?: string;
  CountryOfOrigin?: string;
  CarriageValue?: number;
}

export interface CreateShipmentResponse {
  Shipment: Shipment;
}
