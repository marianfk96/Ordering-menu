import { Item, Price, Size } from './interfaces';

// Service seemed appropriate, so it can be reused. 
// No @Injectable notation, i pprovide it in the component that uses it.
export class DataService {

items: Item[] = [
  {
    itemId: 0,
    name: 'Margherita'
  },
  {
    itemId: 1,
    name: 'Pepperoni'
  },
];

itemPrices: Price[] = [
  {
    itemId: 0,
    sizeId: 0,
    price: 3.99
  },
  {
    itemId: 0,
    sizeId: 1,
    price: 5.99
  },
  {
    itemId: 0,
    sizeId: 2,
    price: 7.99
  },
  {
    itemId: 1,
    sizeId: 0,
    price: 4.42
  },
  {
    itemId: 1,
    sizeId: 1,
    price: 6.52
  },
  {
    itemId: 1,
    sizeId: 2,
    price: 8.62
  },
];

itemSizes: Size[] = [
  {
    sizeId: 0,
    name: 'Small'
  },
  {
    sizeId: 1,
    name: 'Medium'
  },
  {
    //issue with sizeId, it was 0 originally, same as small, i changed it to 2
    sizeId: 2,
    name: 'Large'
  }
];
}
