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
- Registration and Login
- Course Add/Drop
- Explore course catalog
- Course details
- Publish new courses  

#### Database Files -data/
- Users : *Student details database*
- Professor : *Professor details database*
- Courses : *Course details database*  

#### Class files
- FileDataOperationsClass : *Supports all file related operations*
- UpdateFileClass : *Supports functions of writing to course database* 

#### API all endpoints:
 - Home
  * ***/*** : Home page 
 - Categories
  * ***/categories*** : Login Page
  * ***/categories/{catId}*** : Register Page 
  * ***/categories/{catId}/products*** : Student dashboard consisting of registered courses.
  * ***/categories/{catId}/sub-categories*** : Professor dashboard consisting of published  courses.
 - Products
  * ***/products*** : Creating and publishing a course.
  * ***/products/{prodId}*** : Editing a previously published course 
  * ***/products/sort*** : Explore all courses available in the catalog.
  * ***/products/filter*** : Gets details of the particular course.
  * ***/products/search*** : Displays the filtered list of courses w.r.t domain.
  * ***/products/{prodId}/get-invoice*** : Gets details of the particular course.
 - Invalid Routes
  * ***/\**** : Creating and publishing a course.


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
