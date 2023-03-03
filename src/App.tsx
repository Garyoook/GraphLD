import { useEffect } from "react";
import "./App.css";
import Dashboard from "./dashBoard";
import mondial_metadata_ from "./mondial-meta.json";
import { convertPrefixToNamespace } from "./util";

function App() {
    const mondial_metadata = mondial_metadata_;

    useEffect(() => {
        const mondial_metadata_clone: any = [];
        for (const item of mondial_metadata) {
            convertPrefixToNamespace(item);
            mondial_metadata_clone.push(item);
        }
        console.log("modified", mondial_metadata_clone);
    }, []);

    return (
        <div className='App'>
            <header className='App-header'>
                {/* {RDFPage()} */}
                {Dashboard()}
            </header>
        </div>
    );
}

export default App;
