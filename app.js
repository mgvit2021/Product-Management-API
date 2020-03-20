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


/*Basic api details */
app.locals.api_name="Product Management System";
app.locals.api_version="v1";
app.locals.api_description="This PMS api provides an ease in managing the products and helps to make organization's inventory management easiser.";
/* all end-points of API */
app.locals.endPoints={
    "home" : '/', 
    "products_collection" : '/products',
    "product_url" : '/products/{prodId}',
    "sort_products" : '/products/sort',
    "filter_products" : '/products/filter',
    "search_products_url": '/products/search',
    "product_invoice": '/products/{prodId}/get-invoice',
    "categories_collection" : '/categories',
    "category_url" : '/categories/{catId}',
    "category_products_url" : '/categories/{catId}/products',
    "sub_categories_url" : '/categories/{catId}/sub-categories',
}

/* all error message definitions */
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

/* define all categories */
const root = new Category('root');
const stationery=new Category('stationery',root,5);
const electronics=new Category('electronics',root,18);
const mens_clothing = new Category('mens_clothing',root,10);
const books=new Category('books',stationery,5);
const laptops = new Category('laptops',electronics);
const mobiles = new Category('mobiles',electronics);

/*var categorySamples={
    '1':stationery,
    '2':electronics,
    '3':new Category('books',stationery)
}*/

/* all categories stored inside an array */
const categoryStore=[root,stationery,electronics,mens_clothing,books,laptops,mobiles];

/* all products stored inside an array */
const productStore=[
    new Product('Classmate Spiral','Classmate',250,stationery,200,{discount:50,delivery:'available',color:'blue',extra:'buy 10 get 2 free'}),
    new Product('Think Like a Monk','Jay Shetty',473,books,200,{publisher:'Thorsons', ISBN:'0008386595',language:'English'}),
    new Product('HP Envy Core i5 10th Gen','HP',60000,laptops,50,{discount:2,color:'silver',ram:'8 GB DDR4 RAM',warranty:'1 year',processor:'Intel',os:'Windows 10'}),
    new Product('IPhone 11 Pro Max','Apple',110000,mobiles,200,{color:'silver',waterproof:'yes',ram:'8GB',memory:[64,128,256]}),
    new Product('OnePlus 6T','OnePlus',35000,mobiles,200,{color:'black',waterproof:'yes',ram:'8GB',memory:[128,256]}),
    new Product("Allen Solly Men's Polo",'Allen Solly',1020,mens_clothing,200,{color:'black',sizes:[40,42,44,46],fit:'regular'}),
    new Product("Levi's Men Slim Fit Stretchable Jeans",'Levis',3399,mens_clothing,10,{color:'black',size:[28,30,32,34],fit:'slim',material:'cotton'})
];

/* API's entry route, get API details */
app.get('/',(req,res)=>{
    res.send({
            "api_version": app.locals.api_version,
            "api_name": app.locals.api_name,
            "api_description": app.locals.api_description,
            "navigator" : app.locals.endPoints
        });
});

/* fetch all products in store */
app.get('/products',(req,res)=>{

    //exception if no products are available
    try{
        if(productStore.length == 0){
            throw new ErrorWithStatusCode("No Products available currently",400);
        }
        let allProducts = [];
        productStore.forEach( prod => {
            allProducts.push(prod.displayProduct());
        });
        return res.status(200).send({
            status:'success',
            products:allProducts
        });
    }catch(e){
        return sendErrorResponse(400,e.message,res);
    }
});

/* add a new product */
app.post('/products',(req,res)=>{

    // Joi validation
    var {error,value} = validate.createdProduct(req.body);

    // error in validation
    if(error){
        return sendErrorResponse(400,error.details[0].message,res);
    }
    
    const product = req.body;

    // body not defined error
    try{
        if(_.isEmpty(product)){
            throw new ErrorWithStatusCode(messages['emptyBody'],400);
        }

        // error if product already exists
        let productExists = _.find(productStore, {name:product.name});
        if(productExists){
            return sendErrorResponse(400,messages['prodExists'],res);
        }

        let category = _.find(categoryStore, {name:product.category_name});

        //error if category does not exists
        if(!category){
            return sendErrorResponse(404,messages['catNotFound'],res);
        }
        //Root access denied
        if(category.name == 'root'){
            return sendErrorResponse(400,messages['rootAccess'],res);
        }

        //create a new product if every thing works out.
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
    }catch(e){
        return sendErrorResponse(400,e.message,res);
    }
});

/* sort products by query params */
app.get('/products/sort',(req,res)=>{

    let sortOrder = req.query.sort_order; /* ascending/descending order */
    let sortBy = req.query.sort_by; /* parameter on which it has to be sorted */

    // error if any of them is not defined
    if(_.isEmpty(sortOrder) || _.isEmpty(sortBy)){
        return sendErrorResponse(400,messages['invalidQuery'],res);
    }
    
    //sort the list by given parameter
    var sortedList = _.sortBy(productStore,[sortBy]);

    //push displayable product info in a list
    var finalList = [];
    sortedList.forEach((prod) =>{
        finalList.push(prod.displayProduct());
    });
    
    /* display result in given order. */
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

/* filter by multiple valid query parameters */
app.get('/products/filter',(req,res)=>{
    
    let query = req.query;

    // all products displayed when no query is passed

    /*if(_.isEmpty(query)){
        return sendErrorResponse(400,messages['invalidQuery'],res);
    }*/

    // because regular expressions dont work well with lodash.
    _.forEach(query, (value, key)=> {
        query[key]=query[key].toLowerCase();
    });

    // filter products based on query
    let filteredProducts = _.filter(productStore,query);

    /* check if products are available for given query */
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

/* search products by name/brand */
app.get('/products/search',(req,res)=>{

    // using regex to return products if some match is there with the query name
    //search only by name or brand one at a time
    let search_by = req.query;

    // bad query error
    if(search_by.length>1){
        return sendErrorResponse(400,messages['searchQuery'],res);
    }

    /* get all products based on search */
    if(search_by.name){
        var result = productStore.filter( (prod) => { return RegExp(search_by.name, 'i').test(prod.name) });
    }
    if(search_by.brand){
        var result = productStore.filter( (prod) => { return RegExp(search_by.brand, 'i').test(prod.brand) });
    }

    /* check if products returned or not */
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

/* get product by id */
app.get('/products/:prodId',(req,res)=>{
    
    let prodId= req.params.prodId;
    //let product=productStore.find(prod => prod.id == prodId );
    let product = _.find(productStore, (prod) => { return prod.id == prodId; });
    
    /* get product details if it exists */
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

/* update product by id */
app.put('/products/:prodId',(req,res)=>{

    let prodId= req.params.prodId;
    let product = _.find(productStore, (prod) => { return prod.id == prodId; });
    
    // error if product does not exists
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

    // error if no body defined
    if(_.isEmpty(newProduct)){
        return sendErrorResponse(400,messages['emptyBody'],res)
    }

    // error if product with updated name is already in store
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
        
        /* error if category not found */
        if(!newCategory){
            return sendErrorResponse(400,messages['catNotFound'],res);
        }
        /* error if root category accessed */
        if(newCategory.name =='root'){
            return sendErrorResponse(400,messages['rootAccess'],res);
        }
        
        //optimized method to update category's parent
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

/* delete product by id */
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
        return sendErrorResponse(400,messages['notFound'],res); //error if product not found
    }
});

/* get product-invoice */
app.get('/products/:prodId/get-invoice',(req,res)=>{
    
    let prodId= req.params.prodId;
    let product = _.find(productStore, (prod) => { return prod.id == prodId; });
    /* send invoice if product exists */
    if(product){
        let productInvoice = product.getInvoice(); //generate invoice
        productInvoice.billDetails = product.getBill(); //generate bill details
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

/* create a category */
app.post('/categories',(req,res)=>{

    /* validate category on post */
    var {error,value} = validate.createdCategory(req.body);    
    if(error){
        return sendErrorResponse(400,error.details[0].message,res)
    }
    let postCategory = req.body;

    //error on empty post body
    if(_.isEmpty(postCategory)){
        return sendErrorResponse(400,messages['emptyBody'],res)
    }
    /* error if category already exists */
    let categoryFound = _.find(categoryStore, {name:postCategory.name.toLowerCase()});
    if(categoryFound){
        return sendErrorResponse(400,messages['catExists'],res);
    }

    /* error if parent category does not exists */
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

/* get category by id */
app.get('/categories/:catId',(req,res)=>{
    
    let catId= req.params.catId;
    // error on root access
    if(catId==1){
        return sendErrorResponse(400,messages['rootAccess'],res)
    }
    let categoryFound = _.find(categoryStore, (cat) => { return cat.id == catId; });

    // send details if found category else error
    if(categoryFound){
        let category = categoryFound.getCategory();
        let links = categoryFound.auxiliaryLinks();
        category.links=[links.replace,links.delete,links.subCat];
        res.status(200).send(category);
    }else{
        return sendErrorResponse(404,messages['catNotFound'],res);
    }  
});

/* update category */
app.put('/categories/:catId',(req,res)=>{
    
    let catId= req.params.catId;
    // error on root access
    if(catId==1){
        return sendErrorResponse(400,messages['rootAccess'],res)
    }
    let categoryFound = _.find(categoryStore, (cat) => { return cat.id == catId; });

    // error if category not found
    if(!categoryFound){
        return sendErrorResponse(404,messages['notFound'],res);
    }
    
    const updatedCategory = req.body;
    
    //error if body is empty
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

    // root category cannot be deleted
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
        
        //optimized - remove category from parent
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
    
    // error on root access
    if(catId==1){
        return sendErrorResponse(400,messages['rootAccess'],res)
    }

    // error if category not found
    let categoryFound = _.find(categoryStore, (cat) => { return cat.id == catId; });
    if(!categoryFound){
        return sendErrorResponse(404,messages['notFound'],res);
    }

    // get all avaiable products
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

/* get sub-categories of the category */
app.get('/categories/:catId/sub-categories',(req,res)=>{
    let catId = req.params.catId;
    
    // error if category not found
    category = categoryStore.find(cat => cat.id == catId);
    if(!category){
        return sendErrorResponse(404,messages['notFound'],res);
    }

    //throw error if no sub-categories are defined
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

/* mark all other routes as invalid */
app.all('/*',(req,res)=>{
    return sendErrorResponse(400,messages['invRoute'],res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);