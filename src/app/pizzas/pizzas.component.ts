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
  /* need to keep track of the prices and the checked state 0f pizzas on page load, as well as any changes that occur -> 
   2 maps for each, original and current values */
  private _originalPrices:Map<string, number> = new Map()
  public pizzaPrices:Map<string, number> = new Map()
  // 3rd map so checked state can persist on page reload
  public currentlyChecked:Map<string, boolean> = new Map()
  private _originalCheckedState:Map<string, boolean> = new Map()
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
      this.currentlyChecked = new Map(checkedSizesArray)
      this._originalCheckedState = new Map(checkedSizesArray)
    } 
    // if nothing on local storage, create everything from scratch
    else {
      for (let entry of this._dataService.itemPrices) {
        //combine itemId and sizeId to create a unique key
        const key:string =  `${entry.itemId} ${entry.sizeId}`
        this._originalPrices.set(key, entry.price)
        this.pizzaPrices.set(key, entry.price)
        this.currentlyChecked.set(key, true)
        this._originalCheckedState.set(key, true)
      }
    }
    
  }

  // change price with blur event so pizzaPrices is updated when the user is done modifying
  public onPriceChange(key:string, event:Event):void {
    const input = event.target as HTMLInputElement
    let value:number = parseFloat(input.value)
    if (isNaN(value) || value < 0) {
      value = 0.00;
      input.value = value.toFixed(2);
    }
    this.pizzaPrices.set(key, value)
  }

  // toggle checkbox value and update the price
  public onChanges(key:string):void {
    this.currentlyChecked.set(key, !this.currentlyChecked.get(key))
    if (!this.currentlyChecked.get(key)) {
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
    console.log(this._originalCheckedState)
    for (let size of this.pizzaSizes) {
      const key:string = `${pizzaId} ${size.sizeId}`
      // if the key exists, there is also a valid value
      if (this._originalPrices.has(key) && this._originalCheckedState.has(key) ) {
        this.pizzaPrices.set(key, this._originalPrices.get(key)!)
        this.currentlyChecked.set(key, this._originalCheckedState.get(key)!)
      } else {
        console.error('Key does not exist')
      }
    }
  }

  // set prices and checked state to local storage, making sure to convert them to JSON string
  /* items will remain on local storage on page close. Since there is no explicit submit on the changes, we must infer that
  any change the user makes is intended for submission. So I did not clear localStorage to simulate database behaviour */
  private _saveChanges():void {
    const pricesArray = Array.from(this.pizzaPrices.entries())
    const checkedSizesArray = Array.from(this.currentlyChecked.entries())
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

