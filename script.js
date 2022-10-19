//select image element
const img = document.getElementById('image');
//listen for click event 

//add counter for images
let counter = 0;
img.addEventListener("click", function(){
    if(counter === 0){
        img.src = 'assets\\fox1.jpg';
        counter++;
    }
    else if(counter === 1){
        img.src = 'assets\\fox2.jpg';
        counter++;
    }else if(counter === 2){
        img.src = 'assets\\fox3.jpg';
        counter++;
    }else if(counter === 3){
        img.src = 'assets\\fox4.jpg';
        counter++;
    }else if(counter === 4){
        img.src = 'assets\\fox5.jpg';
        counter++;
    }else if(counter === 5){
        img.src = 'assets\\fox6.jpg';
        counter++;
    }else{
        img.src = 'assets\\fox7.jpg';
        counter=0;
    }

})