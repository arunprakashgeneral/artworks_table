
import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FaChevronDown } from "react-icons/fa";
import { ProgressSpinner } from 'primereact/progressspinner'
import axios from 'axios'
import './App.css'
import { InputText } from 'primereact/inputtext';

export default function App() {
  const [data,setData] = useState([])  //To manage data fetched in current page
  const [page, setPage] = useState(1); //To manage the page no  
  const [selectedData, setSelectedData] = useState(null); //To manage all selected data
  const [rowClick,setRowClick] = useState(false); //To know if a checkbox is clicked
  const[selectRow,setSelectRow] = useState('') //To manage no of rows in overlay panel
  const [loading, setLoading] = useState(true) //To manage loading state of page
  const op = useRef(null); //To handle reference of overlay panel

  useEffect(()=>{
    fetchData(page) //API call to fecth data
  },[page])
  
  //Fetch current page data
  const fetchData =async (page)=>{
    setLoading(true)
    try {
      const response = await axios(`https://api.artic.edu/api/v1/artworks?page=${page}`)
      setData(response.data.data)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }
 
  //Fetch additional data in next page
const fetchAdditionalData = async (pagesToFetch)=>{
  let additionalData = []
  try {
    for(let i =1;i<=pagesToFetch;i++){
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page+i}`)
      additionalData = additionalData.concat(response.data.data) 
    }
    return additionalData 
  } catch (error) {
    console.log(error);
  }
}

//Handle the no of rows entered in overlay panel
const handleSubmit= async()=>{
  const numToSelect= parseInt(selectRow,10) //Parsing the entered value 

  if(!isNaN(numToSelect)&&numToSelect>0){
    const rowsOnCurrentPage = data.length 

    if(numToSelect<=rowsOnCurrentPage){  //Checking if the current page is full
      setSelectedData(data.slice(0,numToSelect))
    } else{
      let selected  = data.slice(0,rowsOnCurrentPage) //Storing the curent page 
      const additionalRowsNeeded = numToSelect-rowsOnCurrentPage//Calculating required aditional rows
      const pagesToFetch = Math.ceil(additionalRowsNeeded/12)//Calculating required pages to fetch the additional data 
      const additionalData =  await fetchAdditionalData(pagesToFetch)//Fetching the additional data 
      selected = selected.concat(additionalData.slice(0,additionalRowsNeeded))//Joining the fetched additional data with the previous page data
      setSelectedData(selected)
    }
  }
  setSelectRow()
  op.current.hide()
}
  
    return (
        <div className="card">
          <h2>Artworks Table</h2>
              {loading?(
                    <div className="loading-container">
                      <ProgressSpinner />
                    </div>):(<>
                       <Button 
                           type="button"  
                           className='btn'
                           onClick={(e) => op.current.toggle(e)}
                       ><FaChevronDown /></Button> 
                    <OverlayPanel ref={op}>
                      <div className="custom-overlay-panel">
                        <InputText 
                           placeholder='Enter no of rows'
                           value={selectRow} 
                           onChange={(e)=>setSelectRow(e.target.value)}
                           className="custom-overlay-input"
                         />
                        <Button 
                           className='custom-overlay-submit'
                           label="Submit" 
                           onClick={handleSubmit} 
                         />
                      </div> 
                    </OverlayPanel>
                   <DataTable   
                           value={data} 
                           selectionMode={rowClick ? null : 'checkbox'} 
                           selection={selectedData} 
                           onSelectionChange={(e) =>{setSelectedData(e.value)}} 
                           className='artworks-table'>
                              <Column  selectionMode="multiple" />
                              <Column field='title' header='Title'/>
                              <Column field='place_of_origin' header='Origin'/>
                              <Column field='artist_display' header='Display' />
                              <Column field='date_start' header='Start' />
                              <Column field='date_end' header='End'/>
                  </DataTable>
                  <Paginator 
                           first={(page-1)*12} 
                           rows={12} 
                           totalRecords={180}  
                           onPageChange={(e)=>setPage(e.page+1)} />
                </>)}
        </div>
    );
}
        
