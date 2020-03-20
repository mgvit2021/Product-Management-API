# Product Management API - Final submission VAP

## Getting Started

Clone or download zip file of the project into your local machine.

### Dependencies

```
node v12.14.1
express v4.16.1
nodemon v2.0.2
ejs v2.6.1
update-json-file v1.1.1
shortid v2.2.15
morgan v1.9.1
lodash v4.17.15
```  

### Installing

Install node js from [here](https://nodejs.org/en/download/)  
Check by typing this in command prompt.
```
node --version
```

If node is installed, directly copy the package.json file into your project directory and run
```
npm install
```


---

## Features

* Basic CRUD functionalities of get, add, modify or remove products/categories. 

* Products support extra functionalities like sort, filter and search. These can be helpful if API is integrated into an application.

* Product search is dynamic and can display products which match even some part of query.

* Categories are placed in a tree-like data-structure. If deleted, child categories of the root will move one level up in the tree.

* API follows the [RESTful architecture](https://restfulapi.net/)

## API -all End Points:
- **Home:**
  * ***/*** : Home page, returns basic api details with all resource_urls
- **Categories:**
  * ***/categories*** : Create a new category or fetch all existing categories. Supports [GET,POST].
  * ***/categories/{catId}*** : Fetch, update or delete a category. Suppots [GET,PUT,DELETE]
  * ***/categories/{catId}/products*** : Returns a list of all products under particular category.
  * ***/categories/{catId}/sub-categories*** : Returns a list of all child-categories under particular category.
- **Products:**
  * ***/products*** : Add a new product or fetch all existing products. Supports [GET,POST].
  * ***/products/{prodId}*** : Fetch, update or delete a products. Suppots [GET,PUT,DELETE].
  * ***/products/sort*** : Returns list of products in sorted order w.r.t sort_by and sort_order(asc/desc) query params.
  * ***/products/filter*** : Returns filtered list of products w.r.t filter params passed in the query.
  * ***/products/search*** : Supports dynamic search of products by name/ brand. Regex is used to return products even with slightest match.
  * ***/products/{prodId}/get-invoice*** : Get product invoice with product-SKU, billDetails and all details of product.
- **Invalid:**
  * ***/\**** : All invalid routes are handled by error response.


>[Mridul Gupta](https://www.linkedin.com/in/mridul-gupta2021/)


# Welcome!

This is a generalized Product Management API that can be integrated with an application for ease in product management. 
It can be used for management of products that belong to, single category (like a pharmacy store) or multiple categories (like ebay).  

___

### Functions:

* Basic CRUD functionalities of get, add, modify or remove products/categories. 

* Products support extra functionalities like sort, filter and search. These can be helpful if API is integrated into an application.

* Product search is dynamic and can display products which match even some part of query.

* Categories are placed in a tree-like data-structure. If deleted, child categories of the root will move one level up in the tree.

* API follows the [RESTful architecture](https://restfulapi.net/)
