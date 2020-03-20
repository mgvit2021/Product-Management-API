const express = require('express');
const _ = require('lodash');
const logger = require('morgan');
const {ErrorWithStatusCode,Validator,Category,Product} = require('./MainClass.js')

/* Send error response to server */
function sendErrorResponse(errCode,message,res){
    res.status(errCode).send({
        status : 'error',
        message : message
    });
}

/* Initialize validator class */
var validate = new Validator();
const app = express();

app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({extended: true}));



app.locals.api_name="Product Management System";
app.locals.api_version="v3";
app.locals.api_description="This PMS api provides an ease in managing the data and helps to make organization's inventory management easiser.";

const messages={
    'notFound' : 'Resource not found',
    'catNotFound' : 'Category not found',
    'prodOk' : 'Product added successfully',
    'updateDone' : 'Updated successfully',
    'prodDel' : 'Product deleted successfully',
    'catDel' : 'Category deleted successfully',
    'invalidQuery' : 'Invalid query parameters',
    'catExists' : 'Category already exists',
    'prodExists' : 'Product already exists',
    'catOk' : 'Category created',
    'invalidParent' : 'Invalid parent category',
    'rootAccess' : 'Root access not allowed',
    'rootDel' : 'Root category cannot be deleted',
    'noProd' : 'No products available',
    'emptyBody' : 'Empty body error',
    'invRoute' : 'Invalid operation on route',
    'noMatch' : 'No products found matching the query',
    'searchQuery': 'Search should have only one query parameter.'
};

const endPoints={
    "home" : '/', 
    "products_collection" : '/products',
    "product_url" : '/products/{prodId}',
    "sort_products" : '/products/sort',
    "filter_products" : '/products/filter',
    "product_invoice": '/products/{prodId}/get-invoice',
    "categories-collection" : '/categories',
    "category-url" : '/categories/{catId}',
    "category-products-url" : '/categories/{catId}/products',
    "sub-categories-url" : '/categories/{catId}/sub-categories',
}
var root = new Category('root');
var stationery=new Category('stationery',root,5);
var electronics=new Category('electronics',root,8);
var books=new Category('books',stationery,15);
var homeAppliances = new Category('homeAppliances',electronics,5);

const categoryStore=[root,stationery,electronics,books,homeAppliances];

/*var categorySamples={
    '1':stationery,
    '2':electronics,
    '3':new Category('books',stationery)
}*/


var productStore=[
    new Product('Pencil','Natraj',1000,stationery,200,{color:'green', discount:50}),
    new Product('Book','New Brand',500,books,200),
    new Product('Laptop','Asus',10000,electronics,50,{discount:3})
];


app.get('/',(req,res)=>{
    res.send({
            "api_version": app.locals.api_version,
            "api_name": app.locals.api_name,
            "api_description": app.locals.api_description,
            "navigator" : endPoints
        });
});


app.get('/products',(req,res)=>{
    try{
        if(productStore.length == 0){
            throw new ErrorWithStatusCode("No Products available currently",400);
        }
        let allProducts = [];
        productStore.forEach( prod => {
            allProducts.push(prod.displayProduct());
        })
        return res.status(200).send({
            status:'success',
            products:allProducts
        });
    }catch(e){
        return sendErrorResponse(400,e.message,res);
    }
});

app.post('/products',(req,res)=>{
        
        var {error,value} = validate.createdProduct(req.body);
        if(error){
            return sendErrorResponse(400,error.details[0].message,res);
        }
        
        const product = req.body;

        if(_.isEmpty(product)){
            return sendErrorResponse(400,messages['emptyBody'],res)
        }

        let productExists = _.find(productStore, {name:product.name});
        if(productExists){
            return sendErrorResponse(400,messages['prodExists'],res);
        }

        let category = _.find(categoryStore, {name:product.category_name});

        //check if category exists
        if(!category){
            return sendErrorResponse(404,messages['catNotFound'],res);
        }
        //Root access denied
        if(category.name == 'root'){
            return sendErrorResponse(400,messages['rootAccess'],res);
        }
        let newProduct = 
        new Product(
            product.name,
            product.brand,
            product.basePrice,
            category,
            product.inStock,
            product.tax,
            product.details
            );
    productStore.push(newProduct);
    auxLinks = newProduct.auxiliaryLinks();
    links = [auxLinks.self];
    res.status(201).send({
        status : 'success',
        message : messages['prodOk'],
        value : value,
        links : links
    });
    
});


app.get('/products/sort',(req,res)=>{
    let sortOrder = req.query.sort_order;
    let sortBy = req.query.sort_by;

    if(_.isEmpty(sortOrder) || _.isEmpty(sortBy)){
        return sendErrorResponse(400,messages['invalidQuery'],res);
    }
    
    //sort the list by parameter given
    var sortedList = _.sortBy(productStore,[sortBy]);

    //push displayable product info in a list
    var finalList = [];
    sortedList.forEach((prod) =>{
        finalList.push(prod.displayProduct());
    });
    
    //display result by given order.
    if(sortOrder=='asc'){
        res.send({
            status: 'success',
            products: finalList
        });
    }
    if(sortOrder=='desc'){
        finalList = finalList.reverse();
        res.send({
            status: 'success',
            products: finalList
        });
    }
});

// filter by multiple valid query parameters
app.get('/products/filter',(req,res)=>{
    
    let query = req.query;

    //all products displayed when no query is passed
    /*if(_.isEmpty(query)){
        return sendErrorResponse(400,messages['invalidQuery'],res);
    }*/

    // because regular expressions dont work well with lodash.
    _.forEach(query, (value, key)=> {
        query[key]=query[key].toLowerCase();
    });

    //filter products based on query
    let filteredProducts = _.filter(productStore,query);

    /* check if products are availablefor query */
    if(!_.isEmpty(filteredProducts)){
        
        let productList = [];
        filteredProducts.forEach(prod =>{
            productList.push(prod.displayProduct());
        });
        return res.status(200).send({
            status: 'success',
            products:productList
        });
    }else{
        return sendErrorResponse(404,messages['noProd'],res);
    }
});

app.get('/products/search',(req,res)=>{

    // using regex to return products if some match is there with the query name
    //search only by name or brand
    let search_by = req.query;
    if(search_by.length>1){
        return sendErrorResponse(400,messages['searchQuery'],res);
    }

    if(search_by.name){
        console.log(search_by.name)
        var result = productStore.filter( (prod) => { return RegExp(search_by.name, 'i').test(prod.name) });
    }
    if(search_by.brand){
        var result = productStore.filter( (prod) => { return RegExp(search_by.brand, 'i').test(prod.brand) });
    }

    if(!_.isEmpty(result)){
        let allProducts = [];
        result.forEach(prod=>{
            allProducts.push(prod.displayProduct());
        });
        res.status(200).send({
            status: "success",
            products: allProducts
        });
    }else{
        res.status(404).send({
            status: "error",
            message: messages['noMatch']
        });
    }
});

//CHECK BEFORE DEPLOYING
app.get('/products/:prodId',(req,res)=>{
    
    let prodId= req.params.prodId;
    //let product=productStore.find(prod => prod.id == prodId );
    let product = _.find(productStore, (prod) => { return prod.id == prodId; });
    
    if(product){
        let response = product.displayProduct();
        let auxLinks = product.auxiliaryLinks();
        response.links = [auxLinks.replace,auxLinks.delete];
        res.status(200).send(response);
    }else{
        res.status(404).send({
            status: 'error',
            message: messages['notFound'],
            links:[{
                rel: 'create',
                url: '/products',
                method: 'POST'
            }]
        });
    }  
});

app.put('/products/:prodId',(req,res)=>{

    let prodId= req.params.prodId;
    let product = _.find(productStore, (prod) => { return prod.id == prodId; });

    if(!product){
        return sendErrorResponse(404,messages['notFound'],res);
    }
    /* validate product body */
    const {error,value} = validate.updateProduct(req.body);
    if(error){
        return sendErrorResponse(400,error.details[0].message,res);
    }
    //get updated product
    const newProduct = req.body;
    if(_.isEmpty(newProduct)){
        return sendErrorResponse(400,messages['emptyBody'],res)
    }
    //if product with same name is already in store
    let nameExists = _.find(productStore, (prod) => { return prod.name == newProduct.name; });
    if(nameExists){
        return sendErrorResponse(400,messages['prodExists'],res);
    }
    /* If not updated retain the old details */
    product.name = newProduct.name ? newProduct.name : product.name;
    product.brand = newProduct.brand ? newProduct.brand : product.brand;
    product.basePrice = newProduct.basePrice ? newProduct.basePrice : product.basePrice;
    product.inStock = newProduct.inStock ? newProduct.inStock : product.inStock;
    product.details = newProduct.details ? newProduct.details : product.details;
    product.lastUpdated = new Date(new Date().toLocaleDateString() +' '+new Date().toLocaleTimeString());
    if(newProduct.category_name){
        let newCategory = _.find(categoryStore, {name:newProduct.category_name});
        //let category = categoryStore.find(cat => cat.name == newProduct.category_name);
        if(!newCategory){
            /* if category not found */
            return sendErrorResponse(400,messages['catNotFound'],res);
        }
        if(newCategory.name =='root'){
            return sendErrorResponse(400,messages['rootAccess'],res);
        }
        
        //optimized method
        product.updateCategory(newCategory);

    }
    /* get hateoas links */
    let links = product.auxiliaryLinks();
    res.status(200).send({
        status: 'success',
        message:messages['updateDone'],
        links : [links.self,links.delete]
    });
});


app.delete('/products/:prodId',(req,res)=>{

    let prodId= req.params.prodId;
    let product = _.find(productStore, (prod) => { return prod.id == prodId; });
    if(product){
        /* remove product from category-products array */
        product.deleteProduct();

        /* remove product from store. */
        productStore.splice(productStore.indexOf(product),1);

        res.status(200).send({
            status: 'success',
            message:messages['prodDel']
        });
    }else{
        return sendErrorResponse(400,messages['notFound'],res);
    }
});


app.get('/products/:prodId/get-invoice',(req,res)=>{
    
    let prodId= req.params.prodId;
    let product = _.find(productStore, (prod) => { return prod.id == prodId; });
    //let product=productStore.find(prod => prod.id == prodId );
    if(product){
        let productInvoice = product.getInvoice();
        productInvoice.billDetails = product.getBill();
        res.status(200).send({
            status: 'success',
            invoice:productInvoice
        });
    }else{
        return sendErrorResponse(404,messages['notFound'],res);
    }  
});


/* Categories */

app.get('/categories',(req,res)=>{
    
        let allCategories=[]
        categoryStore.forEach(category => {
            allCategories.push(category.displayCategory())
        });
        res.status(200).send({
            status: 'success',
            categories: allCategories
        });
}); 

app.post('/categories',(req,res)=>{

    var {error,value} = validate.createdCategory(req.body);    
    if(error){
        return sendErrorResponse(400,error.details[0].message,res)
    }
    let postCategory = req.body;
    //console.log(category);
    if(_.isEmpty(postCategory)){
        return sendErrorResponse(400,messages['emptyBody'],res)
    }
    let categoryFound = _.find(categoryStore, {name:postCategory.name.toLowerCase()});
    if(categoryFound){
        return sendErrorResponse(400,messages['catExists'],res);
    }

    let parentCategory = _.find(categoryStore, {name:postCategory.parent_category});
    if(parentCategory){
        let newCategory = new Category(postCategory.name,parentCategory,postCategory.gst);
        categoryStore.push(newCategory);
        let links = newCategory.auxiliaryLinks();
        links = [links.self];
        res.status(201).send({
            status : 'success',
            message : messages['catOk'],
            value : value,
            links: links
        });
    }else{
        sendErrorResponse(400,messages['invalidParent'],res);
    }


}); 

app.get('/categories/:catId',(req,res)=>{
    
    let catId= req.params.catId;
    if(catId==1){
        return sendErrorResponse(400,messages['rootAccess'],res)
    }
    let categoryFound = _.find(categoryStore, (cat) => { return cat.id == catId; });

    if(categoryFound){
        let category = categoryFound.getCategory();
        let links = categoryFound.auxiliaryLinks();
        category.links=[links.replace,links.delete,links.subCat];
        res.status(200).send(category);
    }else{
        return sendErrorResponse(404,messages['catNotFound'],res);
    }  
});

app.put('/categories/:catId',(req,res)=>{
    
    let catId= req.params.catId;
    if(catId==1){
        return sendErrorResponse(400,messages['rootAccess'],res)
    }
    let categoryFound = _.find(categoryStore, (cat) => { return cat.id == catId; });

    if(!categoryFound){
        return sendErrorResponse(404,messages['notFound'],res);
    }
    
    const updatedCategory = req.body;
    //console.log(updatedCategory)
    if(_.isEmpty(updatedCategory)){
        return sendErrorResponse(400,messages['emptyBody'],res);
    }

    /* name of two categories cannot be same */
    let nameExists = _.find(categoryStore, (cat) => { return cat.name == updatedCategory.name; });
    if(nameExists){
        return sendErrorResponse(400,messages['catExists'],res);
    }

    /* If not updated retain the old details */
    categoryFound.name = updatedCategory.name ? updatedCategory.name : categoryFound.name;
    categoryFound.gst = updatedCategory.gst ? updatedCategory.gst : categoryFound.gst;
    
    /* if parent category is defined */
    if(updatedCategory.parent_category){

        let newParentCategory = _.find(categoryStore, {name:updatedCategory.parent_category});
        /* if invalid parent category entered */
        if(!newParentCategory){
            return sendErrorResponse(404,messages['invalidParent'],res);
        }
        /* delete category from prev parent's sub-category */
        categoryFound.updateParentCategory(newParentCategory);
    }

    res.status(200).send({
        status: 'success',
        message: messages['updateDone'],
        links : [{
            href: `/categories/${categoryFound.id}`,
            rel: 'self',
            method: 'GET'
        }]
    });
});

/* delete category */
app.delete('/categories/:catId',(req,res)=>{
    
    let catId= req.params.catId;

    // root category should not be deleted
    if(catId==1){
        return sendErrorResponse(400,messages['rootDel'],res)
    }

    let categoryFound = _.find(categoryStore, (cat) => { return cat.id == catId; });

    //delete the category and subcategories
    if(categoryFound){
        let subCats = categoryFound.subCategories;
        subCats.forEach(id =>{
            let childCategory = _.find(categoryStore, (val) => { return val.id == id; });
            /* when parent category is deleted,
             every child category shifts to one level up parent (like in tree).
             Parent category of deleted category becomes parent of it's children
            */
            childCategory.oneLevelUpParent();
        });
        categoryStore.splice(categoryStore.indexOf(categoryFound),1);

        /* if(typeof(categoryFound.parent_category)=='object'){
             var parent = _.find(categoryStore, (cat) => { return cat.id == categoryFound.parent_category.id; });
         }else{
             var parent = _.find(categoryStore, (cat) => { return cat.name == 'root';});
         }
         parent.subCategories.splice(parent.subCategories.indexOf(categoryFound.id),1);
        */
        
        //optimized
        categoryFound.removeFromParent();

        res.status(200).send({
            status: 'success',
            message:messages['catDel']
        });
    }else{
        return sendErrorResponse(404,messages['notFound'],res);
    }
});

/* get products of specific category */
app.get('/categories/:catId/products',(req,res)=>{
    let catId = req.params.catId;
    if(catId==1){
        return sendErrorResponse(400,messages['rootAccess'],res)
    }
    let categoryFound = _.find(categoryStore, (cat) => { return cat.id == catId; });
    if(!categoryFound){
        return sendErrorResponse(404,messages['notFound'],res);
    }
    let productsAvailable = categoryFound.products;
    if(productsAvailable.length>0){
        let allProducts = [];
        productsAvailable.forEach( prodId => {
            let product = _.find(productStore, (prod) => { return prod.id == prodId; });
            allProducts.push(product.displayProduct());
        });
        res.status(200).send({
            status: 'success',
            products:allProducts
        });
    }else{
        return sendErrorResponse(404,messages['noProd'],res);
    }
});

app.get('/categories/:catId/sub-categories',(req,res)=>{
    let catId = req.params.catId;
    category = categoryStore.find(cat => cat.id == catId);

    if(!category){
        return sendErrorResponse(404,messages['notFound'],res);
    }
    try{
        if(category.subCategories.length == 0){
            throw new ErrorWithStatusCode("No Sub-categories available under this category",404);
        }

        let subCategories=[]
        category.subCategories.forEach((id)=>{
            var subCategory = categoryStore.find(cat => cat.id == id);
            subCategories.push(subCategory.displayCategory());
        });
        res.status(200).send({
            status:'success',
            categories:subCategories
        });

    }catch(e){
        return sendErrorResponse(404,e.message,res);
    }
}); 

app.all('/*',(req,res)=>{
    return sendErrorResponse(400,messages['invRoute'],res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);