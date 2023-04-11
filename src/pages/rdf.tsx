import { useEffect, useState } from "react";
import { getRepoList } from "./service";

function RDFPage() {
    const [column, setColumn] = useState([]);
    const [data, setData] = useState<any>({});

    async function fetchRepos() {
        try {
            const response = await getRepoList();

            if (response.status === 200) {
                const data = response.data;
                setColumn(data.head.vars);
                setData(data.results.bindings[0]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchRepos();
    }, []);

    return (
        <div>
            <div>{JSON.stringify(column)}</div>
            <div>{JSON.stringify(data)}</div>
        </div>
    );
}

export default RDFPage;
