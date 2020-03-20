# Product Management API - Final submission VAP

This is a generalized Product Management API that can be integrated with an application for ease in product management. 
It can be used for management of products that belong to, single category (like a pharmacy store) or multiple categories (like ebay). 
The API is written using `Node.js` , `Express.js` and is documented using `OAS 3.0` or `swagger`

**[Swagger Hub Documentation Link]**(https://app.swaggerhub.com/apis/mgvit2021/ProductManagementSystemAPI/1.0.0)


### Installation

Install node js from [here](https://nodejs.org/en/download/)  
Check by typing this in command prompt.
```
node --version
```

If node is installed, directly copy the package.json file into your project directory and run
```
npm install
```

Run command `npm start` or  `nodemon app` to launch the server.

## Project Description

The project consists of two main files : **app.js** and **MainClass.js**. The *app.js* file includes all route definitions and error handler functions.  
The *MainClass.js* consists of four classes:

* **ErrorWithStatusCode** : Inherits Error class and handle exceptions in the API.

* **Validator** : This class consists of methods, that are used for input validation using JOI Schema.

* **Category** : Category class includes all the category information and methods required for various operations.

* **Product** : Product class includes all product details and methods that are required for various operations.

Categories are arranged in tree-like data structure. **Root category** is the base category and is not accessible. Each category can have multiple sub-categories (child nodes). Categories can be updated and deleted. Child-nodes of the deleted category will become child of it's parent.

Product, when created must belong to a category and contain all valid product info. Extra details can also be added to the product object. Products support operations like sort, filter and search. Product invoice can also be fetched, consisting of the product SKU and complete price-breakdown.

## Key Features

* Basic CRUD functionalities of get, add, modify or remove products/categories. 

* Products support extra functionalities like sort, filter and search. These can be helpful when API is integrated into an application.

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
  * ***/products/{prodId}*** : Fetch, update or delete products. Suppots [GET,PUT,DELETE].
  * ***/products/sort*** : Returns list of products in sorted order w.r.t sort_by and sort_order(asc/desc) query params.
  * ***/products/filter*** : Returns filtered list of products w.r.t filter params passed in the query.
  * ***/products/search*** : Supports dynamic search of products by name/ brand. Regex is used to return products even with slightest match.
  * ***/products/{prodId}/get-invoice*** : Get product invoice with product-SKU, billDetails and all details of product.
- **Invalid:**
  * ***/\**** : All invalid routes are handled by error response.


>[Mridul Gupta](https://www.linkedin.com/in/mridul-gupta2021/)
