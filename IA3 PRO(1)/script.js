// MICRO-BOUTIQUE INVENTORY PORTAL
// Product and sales data are stored in JavaScript arrays.

// 1. SAMPLE PRODUCTS
let products=[
 {id:1,name:"Linen Summer Dress",category:"Clothing",size:"M",price:1899,quantity:18,limit:10},
 {id:2,name:"Floral Cotton Kurti",category:"Ethnic Wear",size:"L",price:1299,quantity:7,limit:10},
 {id:3,name:"Gold Hoop Earrings",category:"Accessories",size:"Free",price:499,quantity:32,limit:10},
 {id:4,name:"Everyday Tote Bag",category:"Bags",size:"Free",price:999,quantity:0,limit:10},
 {id:5,name:"Block Heel Sandals",category:"Footwear",size:"38",price:1599,quantity:21,limit:10}
];
let sales=[];
let nextId=6,nextSaleId=1;

// 2. COMMON FUNCTIONS
function money(value){return "₹"+Math.round(value).toLocaleString("en-IN")}
function getStatus(p){
 if(p.quantity===0)return "out";
 if(p.quantity<=p.limit)return "low";
 return "in";
}
function statusText(s){return s==="out"?"Out of stock":s==="low"?"Low stock":"In stock"}
function notify(text){
 let box=document.getElementById("message");
 box.textContent=text;box.style.display="block";
 setTimeout(()=>box.style.display="none",2200);
}

// 3. NAVIGATION
function showPage(name,button){
 document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
 document.getElementById(name).classList.remove("hidden");
 document.querySelectorAll(".nav").forEach(b=>b.classList.remove("active"));
 if(button)button.classList.add("active");
 if(name==="products")showProducts();
 if(name==="alerts")showAlerts();
 if(name==="sales")showSales();
 if(name==="reports")showReports();
 document.getElementById("menu").classList.remove("show");
}
function toggleMenu(){document.getElementById("menu").classList.toggle("show")}

// 4. DASHBOARD
function showDashboard(){
 let units=0,revenue=0;
 let attention=products.filter(p=>getStatus(p)!=="in");
 products.forEach(p=>units+=p.quantity);
 sales.forEach(s=>revenue+=s.total);
 totalProducts.textContent=products.length;
 totalUnits.textContent=units;
 lowItems.textContent=attention.length;
 document.getElementById("revenue").textContent=money(revenue);

 recentTable.innerHTML=products.slice(-5).reverse().map(p=>`
 <tr><td>${p.name}</td><td>${p.category}</td><td>${money(p.price)}</td>
 <td>${p.quantity}</td><td><span class="status ${getStatus(p)}">${statusText(getStatus(p))}</span></td></tr>`).join("");

 dashboardAlerts.innerHTML=attention.length
 ?attention.map(p=>`<p>${p.name} — ${p.quantity} units left (${statusText(getStatus(p))})</p>`).join("")
 :"<p>No stock alerts. Everything is looking good!</p>";
}

// 5. PRODUCT MANAGEMENT
function showProducts(){
 let text=search.value.toLowerCase(),category=categoryFilter.value;
 let result=products.filter(p=>p.name.toLowerCase().includes(text)&&(category==="All"||p.category===category));
 productTable.innerHTML=result.map(p=>`
 <tr><td>${p.name}</td><td>${p.category}</td><td>${p.size}</td><td>${money(p.price)}</td>
 <td>${p.quantity}</td><td><span class="status ${getStatus(p)}">${statusText(getStatus(p))}</span></td>
 <td><button class="action" onclick="editProduct(${p.id})">Edit</button>
 <button class="action delete" onclick="deleteProduct(${p.id})">Delete</button></td></tr>`).join("");
}
function openProductForm(p=null){
 productForm.reset();
 editId.value=p?p.id:"";
 formTitle.textContent=p?"Edit Product":"Add Product";
 if(p){pName.value=p.name;pCategory.value=p.category;pSize.value=p.size;pPrice.value=p.price;pQuantity.value=p.quantity;pLimit.value=p.limit}
 else pLimit.value=10;
 productModal.classList.remove("hidden");
}
productForm.addEventListener("submit",function(event){
 event.preventDefault();
 let id=Number(editId.value);
 let data={name:pName.value.trim(),category:pCategory.value,size:pSize.value.trim(),
 price:Number(pPrice.value),quantity:Number(pQuantity.value),limit:Number(pLimit.value)};
 if(id){Object.assign(products.find(p=>p.id===id),data);notify("Product updated")}
 else{data.id=nextId++;products.push(data);notify("Product added")}
 closeForms();refreshWebsite();
});
function editProduct(id){openProductForm(products.find(p=>p.id===id))}
function deleteProduct(id){
 if(confirm("Delete this product?")){
 products=products.filter(p=>p.id!==id);notify("Product deleted");refreshWebsite();
 }
}

// 6. STOCK ALERTS
function showAlerts(){
 let out=products.filter(p=>getStatus(p)==="out");
 let low=products.filter(p=>getStatus(p)==="low");
 let healthy=products.filter(p=>getStatus(p)==="in");
 outCount.textContent=out.length;lowCount.textContent=low.length;healthyCount.textContent=healthy.length;
 let attention=[...out,...low];
 alertList.innerHTML=attention.length?attention.map(p=>`
 <p>${p.name} — ${p.quantity} units left.
 <button class="action" onclick="editProduct(${p.id})">Update stock</button></p>`).join("")
 :"<p>No products need restocking.</p>";
}

// 7. SALES MANAGEMENT
function openSaleForm(){
 let available=products.filter(p=>p.quantity>0);
 saleProduct.innerHTML=available.map(p=>`<option value="${p.id}">${p.name} (${p.quantity} available)</option>`).join("");
 if(!available.length){notify("No products available");return}
 saleQuantity.value=1;updateSaleTotal();saleModal.classList.remove("hidden");
}
function updateSaleTotal(){
 let p=products.find(item=>item.id===Number(saleProduct.value));
 saleTotal.textContent=p?money(p.price*Number(saleQuantity.value)):money(0);
}
saleProduct.addEventListener("change",updateSaleTotal);
saleQuantity.addEventListener("input",updateSaleTotal);
saleForm.addEventListener("submit",function(event){
 event.preventDefault();
 let p=products.find(item=>item.id===Number(saleProduct.value));
 let qty=Number(saleQuantity.value);
 if(!p||qty<1||qty>p.quantity||!Number.isInteger(qty)){notify("Enter a valid quantity");return}
 p.quantity-=qty;
 sales.push({id:nextSaleId++,name:p.name,quantity:qty,total:p.price*qty,date:new Date().toLocaleDateString("en-IN")});
 closeForms();notify("Sale recorded and stock updated");refreshWebsite();
});
function showSales(){
 let revenue=0,sold=0;
 sales.forEach(s=>{revenue+=s.total;sold+=s.quantity});
 salesRevenue.textContent=money(revenue);itemsSold.textContent=sold;transactions.textContent=sales.length;
 salesTable.innerHTML=sales.length?sales.map(s=>`
 <tr><td>#${s.id}</td><td>${s.name}</td><td>${s.quantity}</td><td>${money(s.total)}</td><td>${s.date}</td></tr>`).join("")
 :"<tr><td colspan='5'>No sales recorded yet.</td></tr>";
}

// 8. REPORTS
function showReports(){
 let stock=0,revenue=0,sold=0;
 products.forEach(p=>stock+=p.quantity*p.price);
 sales.forEach(s=>{revenue+=s.total;sold+=s.quantity});
 stockValue.textContent=money(stock);reportProducts.textContent=products.length;
 reportSold.textContent=sold;reportRevenue.textContent=money(revenue);
 let categories=["Clothing","Ethnic Wear","Accessories","Bags","Footwear"];
 categoryReport.innerHTML=categories.map(c=>`<p>${c}: <strong>${products.filter(p=>p.category===c).length}</strong> products</p>`).join("");
}

// 9. CLOSE FORMS AND UPDATE WEBSITE
function closeForms(){productModal.classList.add("hidden");saleModal.classList.add("hidden")}
function refreshWebsite(){showDashboard();showProducts();showAlerts();showSales();showReports()}
refreshWebsite();
