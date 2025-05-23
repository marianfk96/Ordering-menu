import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { Item, Size } from '../interfaces';
import { CommonModule, NgForOf } from '@angular/common';

@Component({
  selector: 'app-pizzas',
  imports: [CommonModule, NgForOf],
  // data service is provided here, to create an instance only when it's used
  providers: [DataService],
  templateUrl: './pizzas.component.html',
  styleUrl: './pizzas.component.scss'
})
export class PizzasComponent {

  public pizzas:Item[]
  // need to keep track of the prices the pizzas had on page load, as well as any changes that occur -> 2 maps
  private _originalPrices:Map<string, number> = new Map()
  public pizzaPrices:Map<string, number> = new Map()
  // 3rd map so checked state can persist on page reload
  public isChecked:Map<string, boolean> = new Map()
  public pizzaSizes:Size[]
  public activeIndex:number | null = null

  constructor(private readonly _dataService:DataService) {
    this.pizzas = this._dataService.items
    this.pizzaSizes = this._dataService.itemSizes
    this.buildPriceMap()
    // update local storage just before page reloads, not for evey change
    window.addEventListener('beforeunload', this._saveChanges.bind(this))
  }

  /* decided to create a map out of the itemPices array for better search performance. 
  it creates a small overhead on initial setup, but the benefit is O(1) time per lookup */

  private buildPriceMap():void {
    // check if data exists on local storage and initialize the maps with the data that were retrieved
    const storedPrices = localStorage.getItem('pizzaPrices')
    const checkedSizes = localStorage.getItem('checkedSizes')
    if (storedPrices && checkedSizes) {
      const pricesArray: [string, number][] = JSON.parse(storedPrices)
      const checkedSizesArray: [string, boolean][] = JSON.parse(checkedSizes)
      this.pizzaPrices = new Map(pricesArray)
      this._originalPrices = new Map(pricesArray)
      this.isChecked = new Map(checkedSizesArray)
    } 
    // if nothing on local storage, create everything from scratch
    else {
      for (let entry of this._dataService.itemPrices) {
        //combine itemId and sizeId to create a unique key
        const key:string =  `${entry.itemId} ${entry.sizeId}`
        this._originalPrices.set(key, entry.price)
        this.pizzaPrices.set(key, entry.price)
        this.isChecked.set(key, true)
      }
    }
    
  }

  // change price with blur event so pizzaPrices is updated when the user is done modifying
  public onPriceChange(key:string, event:Event):void {
    const input = event.target as HTMLInputElement
    const value:number = parseFloat(input.value)
    this.pizzaPrices.set(key, value)
  }

  // toggle checkbox value and update the price
  public onChanges(key:string):void {
    this.isChecked.set(key, !this.isChecked.get(key))
    if (!this.isChecked.get(key)) {
      this.pizzaPrices.set(key, 0.00)
    }
  }

  // set the active index when the user clicks the expandable panels to implement the accordion functionality
  public setActiveIndex(i:number):void {
    this.activeIndex = this.activeIndex === i ? null : i
  }

  public onRevert():void {
    // if revert is visible, we definitely have an active index
    const pizzaId:number = this.pizzas[this.activeIndex!].itemId
    for (let size of this.pizzaSizes) {
      const key:string = `${pizzaId} ${size.sizeId}`
      /* ts cannot ascertain that originalPrices contains the key. if key is not found then null value is returned, which is NaN,
      so before inserting it to pizzaPrices, we need to check */
      const originalPrice:number | undefined = this._originalPrices.get(key)
      if (originalPrice) {
        this.pizzaPrices.set(key, originalPrice)
      } else {
        console.error('Key does not exist')
      }
    }
  }

  // set prices and checked state to local storage, making sure to convert them to JSON string
  private _saveChanges():void {
    const pricesArray = Array.from(this.pizzaPrices.entries())
    const checkedSizesArray = Array.from(this.isChecked.entries())
    localStorage.setItem('pizzaPrices', JSON.stringify(pricesArray))
    localStorage.setItem('checkedSizes', JSON.stringify(checkedSizesArray))
  }

  // revert button will only show up if there are discrepancies between orignial and current prices
  public hasPriceChanges(id:number):boolean {
    for (let size of this.pizzaSizes) {
      const key = `${id} ${size.sizeId}`
      if (this.pizzaPrices.get(key) !== this._originalPrices.get(key)) {
        return true
      }
    }
    return false
  }

}
