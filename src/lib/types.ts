export type Inventory = {
	food: number;
	toy: number;
	treat: number;
};

export interface User {
	id: number;
	name: string;
	email: string;
	password: string;
	budget: number;
	inventory: Inventory;
}

// src/lib/types.ts
export interface SafeUser {
	name: string;
	email: string;
	isAdmin: boolean;     
	budget: number;
	inventory: {
	  food: number;
	  toy: number;
	  treat: number;
	};
  }
  
export interface Pet {
	id: string;
	name: string;
	type: string; 
	age: number;
	breed: string;
	adoptedBy: string | null;
	hunger: number;
	happiness: number;
	description: string;
}
