const GST=15; 
const _=require('lodash');
const joi=require('@hapi/joi');

class ErrorWithStatusCode extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
}


class Category{
    constructor(name,parentCategory,gst){
        Category.count = Category.count ? Category.count + 1 : 1;
        this.id = Category.count;
        this.name = name.toLowerCase();
        this.parent = parentCategory ? parentCategory : 'root';
        this.gst = gst ? gst : GST;
        this.products=[];
        this.subCategories=[];
        if(parentCategory){
            parentCategory.addSubCategory(this.id);
        }
    }
    addProduct(id){
        this.products.push(id);
    }
    removeProduct(id){
        this.products.splice(this.products.indexOf(id),1);
    }
    addSubCategory(id){
        this.subCategories.push(id)
    }
    removeSubCategory(id){
        this.subCategories.splice(this.subCategories.indexOf(id));
    }
    removeFromParent(){
        this.parent.removeSubCategory(this.id);
    }
    oneLevelUpParent(){
        if(this.parent.parent){
        this.parent = this.parent.parent;
        }
    }
    
    async updateParentCategory(newCategory){
        await this.parent.removeSubCategory(this.id);
        newCategory.addSubCategory(this.id);
        this.parent = newCategory;
    }
    displayCategory(){
        let output= {
            'id':this.id,
            'name':this.name,
            'parent_category': this.parent.name
        }

        return output;
    }
    getCategory(){
        let output= {
            'id':this.id,
            'name':this.name,
            'parent_category': this.parent.name,
            'gst':this.gst,
            'totalProducts': this.products.length,
        }
        if(this.subCategories.length>0){
            output.subCategories = true;
        }else{
            output.subCategories = false;
        }
        return output;
    }
    auxiliaryLinks(){
        return{
            'self':{
                href : `/categories/${this.id}`,
                rel : 'self',
                method : 'GET'
            },
            'replace':{
                href : `/categories/${this.id}`,
                rel : 'replace',
                method : 'PUT'
            },
            'delete':{
                href : `/categories/${this.id}`,
                rel : 'delete',
                method : 'DELETE'
            },
            'subCat':{
                href : `/categories/${this.id}/sub-categories`,
                rel : 'sub category',
                method : 'GET'
            }
        };
    }
}

class Product{
    constructor(name,brand,basePrice,category,inStock,details){
        Product.count = Product.count ? Product.count + 1 : 1;
        this.id = Product.count;
        this.name = name.toLowerCase();
        this.brand = brand.toLowerCase();
        this.basePrice = basePrice;
        this.category = category; //complete category object
        this.categoryId = category.id;
        this.categoryName = category.name.toLowerCase();
        this.inStock = inStock;
        this.tax = category.gst;
        this.details = details ? details : {};
        this.discount = this.details.discount ? this.details.discount : 0;
        this.color = this.details.color ? this.details.color.toLowerCase() : null;
        this.outOfStock='false'
        if(inStock==0){
            this.outOfStock='true'
        }
        let d = new Date();
        this.created = new Date(d.toLocaleDateString() +' '+d.toLocaleTimeString());
        this.lastUpdated = this.created;
        
        //add product to category when created
        this.category.addProduct(this.id);
    }

    // product details to be displayed.
    displayProduct(){
        let output = {
            'id': this.id,
            'name' : this.name,
            'brand' : this.brand,
            'basePrice' : this.basePrice,
            'categoryId' : this.categoryId,
            'categoryName' : this.category.name,
            'details': this.details,
            'tax': this.tax,
            'inStock' : this.inStock,
            'outOfStock' : this.outOfStock,
            //'lastUpdated': this.lastUpdated
        }
        if(this.inStock==0){
            output.outOfStock='true';
        }
        return output;
    }

    getInvoice(){
        let prodId = this.id+'';
        let catId = this.categoryId+'';
        let uid = catId.padStart(3,0) + prodId.padStart(3,0);
        let prodSKU = this.categoryName+'-'+uid;
        this.prodSKU = prodSKU;
        let productInvoice = {
            'prodSKU': this.prodSKU,
            'name' : this.name,
            'brand' : this.brand,
            'basePrice' : this.basePrice,
            'categoryId' : this.categoryId,
            'categoryName' : this.category.name,
            'details': this.details,
            'tax': this.tax,
        };
        return productInvoice;
    }

    //async because of 
    async updateCategory(newCategory){
        await this.category.removeProduct(this.id); //remove from old category
        newCategory.addProduct(this.id); // add to updated category
        this.categoryId = newCategory.id;
        this.category = newCategory;
    }
    
    deleteProduct(){
        this.category.removeProduct(this.id);
    }
    getBill(){
        let baseAmt = this.basePrice;
        let taxAmt = baseAmt * (this.tax / 100);
        let discountAmt = baseAmt * (this.discount / 100);

        let totalPrice = taxAmt + (baseAmt - discountAmt);

        let priceBreakDown = {baseAmt,taxAmt,discountAmt,totalPrice};
        return priceBreakDown;
    }


    /* easier fetch of HATEOAS links */
    auxiliaryLinks(){
        return {
            self:{
                href : `/products/${this.id}`,
                rel : 'self',
                method : 'GET'
            },
            replace:{
                href : `/products/${this.id}`,
                rel : 'replace',
                method : 'PUT'
            },
            create:{
                href : `/products`,
                rel : 'create',
                method : 'POST'
            },
            delete:{
                href : `/products/${this.id}`,
                rel : 'delete',
                method : 'DELETE'
            }
        };
    }
}




class Validator {
    
    createdProduct(data){
        
        const schema=joi.object({
            'name': joi.string().required(),
            'brand': joi.string().required(),
            'basePrice': joi.number().integer().min(0).required(),
            'category_name': joi.string().required(),
            'inStock': joi.number().integer().min(0).default(0).required(),
            'details':joi.object().optional()
        });
        return schema.validate(data);
    }
    updateProduct(data){
        
        const schema=joi.object({
            'name': joi.string().optional(),
            'brand': joi.string().optional(),
            'basePrice': joi.number().min(0).optional(),
            'category_name': joi.string().optional(),
            'inStock': joi.number().integer().min(0).default(0).optional(),
            'details':joi.object().optional()
        });
        return schema.validate(data);
    }
    
    createdCategory(data){
        
        const schema=joi.object({
            'name': joi.string().required(),
            'parent_category' : joi.string().required(),
            'gst' : joi.number().integer().min(0).optional()
        });
        return schema.validate(data);
    }

    updateCategory(data){
        const schema=joi.object({
            'name': joi.string().optional(),
            'parent_category' : joi.string().optional(),
            'gst' : joi.number().integer().min(0).optional()
        });
        return schema.validate(data);
    }
}

module.exports={ErrorWithStatusCode,Validator,Category,Product};