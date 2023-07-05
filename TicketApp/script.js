let allfilters=document.querySelectorAll(".filter");
let openModule=document.querySelector(".open-module");
let closeModule=document.querySelector(".close-module");
let allFilterClasses=["red","blue","green","yellow","black"];
let ticketsContainer=document.querySelector(".tickets-container");

let myDB=window.localStorage;

let ticketModuleOpen=false;
let isTextTyped=false;

openModule.addEventListener("click",openticketmodule);
closeModule.addEventListener("click",closeticketmodule);

//looping on all filters
for(let i=0;i<allfilters.length;i++){
    allfilters[i].addEventListener("click",selectfilter);
}

function selectfilter(e){
    //this is that case for example we have already clicked on red filter and on screen
    //only red  tickets are seen and then we are again deselcting red filter
    if(e.target.classList.contains("active-filter")){
        e.target.classList.remove("active-filter");
        ticketsContainer.innerHTML="";
        loadTickets();
    }
    //Now imagine we are currently on red filter and now we are pressing blue filter
    else{
        if(document.querySelector(".active-filter")){
            document.querySelector(".active-filter").classList.remove("active-filter");
        }
        e.target.classList.add("active-filter");
        ticketsContainer.innerHTML="";
        let filterclicked=e.target.classList[1];
        loadselectedtickets(filterclicked);

    }
}
function loadselectedtickets(filter){
      let allTickets=myDB.getItem("allTickets");
      if(allTickets){
        allTickets=JSON.parse(allTickets);
        for(let i=0;i<allTickets.length;i++){
            //appending only those tickets with selected filter
            let ticketobj = allTickets[i];
            if(ticketobj.ticketfilter==filter){
                appendTicket(ticketobj);
            }
        }
      }
}


function loadTickets(){
    let allTickets=localStorage.getItem(allTickets);
    if(allTickets){
    allTickets=JSON.parse(allTickets);
    for(let i=0;i<allTickets.length;i++){
        let ticketobj=allTickets[i];
        appendTicket(ticketobj);
    }
   }
}  
loadTickets();

function openticketmodule(e){
     //console.log(e);
     if(ticketModuleOpen){
        return;
     }

     //if ticket module is closed we will have to create a ticket
     //module dynamically
     let ticketmodule=document.createElement("div");
     ticketmodule.classList.add("ticket-module");
     ticketmodule.innerHTML=`
      <div class="ticket-text" contenteditable="true"
      >Enter your text
      </div>
      <div class="ticket-filters">
        <div class="ticket-filter2 red selected-filter"></div>
        <div class="ticket-filter2 blue"></div>
        <div class="ticket-filter2 green"></div>
        <div class="ticket-filter2 yellow"></div>
        <div class="ticket-filter2 black"></div>
      </div>
      `;
      document.querySelector("body").append(ticketmodule);
      ticketModuleOpen=true;
      isTextTyped=false;
      let tickettextdiv=ticketmodule.querySelector(".ticket-text");

      tickettextdiv.addEventListener("keypress",handlekeyPress);

      let ticketFilters=ticketmodule.querySelectorAll(".ticket-filter2");

      for(let i=0;i<ticketFilters.length;i++){
          ticketFilters[i].addEventListener("click",function(e){
             if(e.target.classList.contains("selected-filter")){
                return;
             }
             document.querySelector(".selected-filter").classList.remove("selected-filter");
             e.target.classList.add("selected-filter");
          });
      }

}
function closeticketmodule(e){
    if(ticketModuleOpen){
        document.querySelector(".ticket-module").remove();
        ticketModuleOpen=false;
    }
}

function  handlekeyPress(e){
    //console.log(e);
    //this means that the ticketmodule will get closed only when
    //something is typed in text area and then we press enter 
    if(e.key=="Enter" && isTextTyped && e.target.textContent){
        let filterSelected=document.querySelector(".selected-filter").classList[1];
        let ticketId=uuid();
        let ticketinfoObject={
            ticketfilter :filterSelected,
            ticketvalue:e.target.textContent,
            ticketId: ticketId,
        };
        appendTicket(ticketinfoObject);
        //for forcefully closing the ticket module
        closeModule.click();
        saveTicketToDb(ticketinfoObject);
    }
    if(!isTextTyped){
        isTextTyped=true;
        e.target.textContent= "";
    }
}

  function saveTicketToDb(ticketinfoObject){
    let allTickets=myDB.getItem("allTickets");
    if(allTickets){
       allTickets=JSON.parse(allTickets);
       allTickets.push(ticketinfoObject);
       myDB.setItem("allTickets",JSON.stringify(allTickets));
    }
    else{
        let allTickets=[ticketinfoObject];
        myDB.setItem("allTickets",JSON.stringify(allTickets));
    }
  }

function appendTicket(ticketinfoObject){
    let{ticketfilter,ticketvalue,ticketId}=
    ticketinfoObject;
    console.log(ticketfilter);
    // console.log(ticketinfoObject);

    let ticketDiv=document.createElement("div");
    ticketDiv.classList.add("ticket");
    ticketDiv.innerHTML=`
    <div class="ticket-header ${ticketfilter}"></div>
    <div class="ticket-content">
        <div class="ticket-info">
          <div class="ticket-id">${ticketId}</div>
          <div class="ticket-delete"><i class="fa-solid fa-trash-can"></i></div>
        </div>
        <div class="ticket-value">
           ${ticketvalue}
        </div>
    </div>
    `;
    console.log(ticketDiv);
    let ticketheader=ticketDiv.querySelector(".ticket-header");

    ticketheader.addEventListener("click",function(e){
        let currentFilter=e.target.classList[1];
        let indexofCurrentFilter= allFilterClasses.indexOf(currentFilter);

        let newIndex=(indexofCurrentFilter+1)% allFilterClasses.length;
        let newFilter=allFilterClasses[newIndex];
            console.log({currentFilter,newFilter});
            console.log(ticketheader);
        
        ticketheader.classList.remove(currentFilter);
        ticketheader.classList.add(newFilter);
        
        //JSON parse basically converts string into jason so that
        //we can access the ticket data one by one by indexing
        let allTickets=JSON.parse(myDB.getItem("allTickets"));

        //This for loop is for changing the color of a ticket .For example a ticket which was 
        //blue(2nd priority)..now the content of that ticket becomes ticket of higher priority.therefore
        //it needs to be updated to a red colored ticket which is in fact ticket of higher priority
        for(let i=0;i<allTickets.length;i++){
            if(allTickets[i].ticketId==ticketId){
                allTickets[i].ticketfilter=newFilter;
            }
        }
        myDB.setItem("allTickets",JSON.stringify(allTickets));

    });
    //Button for deleting the ticket which is prepared dynamically
    let deleteTicketBtn=ticketDiv.querySelector(".ticket-delete");
    deleteTicketBtn.addEventListener("click",function(e){
        //removing the ticket from the screen
        ticketDiv.remove();
        //also we need to remove ticket from the database
        let allTickets=JSON.parse(myDB.getItem("allTickets"));

        let updatedTicket=allTickets.filter(function(ticketobject){
            if(ticketobject.ticketId==ticketId){
                return false;
            }
            return true;

        });
        myDB.setItem("allTickets",JSON.stringify(updatedTicket));
    });
   ticketsContainer.append(ticketDiv);
}

