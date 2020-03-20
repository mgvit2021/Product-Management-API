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
  * ***/*** : Home page 
  * ***/users/login*** : Login Page
  * ***/users/register*** : Register Page 
  * ***/dashboard/student/*** : Student dashboard consisting of registered courses.
  * ***/dashboard/professor/*** : Professor dashboard consisting of published  courses.
  * ***/dashboard/professor/add/*** : Creating and publishing a course.
  * ***/dashboard/professor/edit/*** : Editing a previously published course 
  * ***/dashboard/explore/*** : Explore all courses available in the catalog.
  * ***/dashboard/explore/detail*** : Gets details of the particular course.
  * ***/dashboard/explore/filter*** : Displays the filtered list of courses w.r.t domain.


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
