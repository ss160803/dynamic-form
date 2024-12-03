import React from 'react';
import DynamicForm from './dynamicForm'
import './index.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Dynamic Form</h1>
      </header>
        <div className='content'>
           <DynamicForm/>
        </div>
      <footer>
        <p>&copy; 2024 Dynamic Form. All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;
