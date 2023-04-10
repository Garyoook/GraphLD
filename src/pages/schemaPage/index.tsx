import { Backdrop, CircularProgress, Grid, Paper } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { useEffect, useState } from "react";
import { sendSPARQLquery } from "../../request";
import { prefix_mapping } from "../../util";

function SchemaPage() {
    const query = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		PREFIX mons: <http://www.semwebtech.org/mondial/10/meta#>
		SELECT DISTINCT ?class ?superclass
		WHERE {
		  ?class a rdfs:Class .
		  OPTIONAL { ?class rdfs:subClassOf ?superclass . }
		}`;
    const [columns, setColumns] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleQuery = async () => {
        const repositoryID = "SemanticWebVis";

        try {
            setLoading(true);
            const queryRes = await sendSPARQLquery(repositoryID, query);

            const head = queryRes.head.vars;
            const results_bindings = queryRes.results.bindings;

            const columns = head.map((h) => ({
                field: h,
                headerName: h,
                minWidth: 300,
                maxWidth: 600,
            }));
            setColumns(columns);

            const colKeys = columns.map((col) => col.field);
            console.log("colKeys: ", colKeys);

            const data = results_bindings
                .map((data_binding: any, index: number) => {
                    const obj = {};
                    for (const key of colKeys) {
                        const value = data_binding[key].value;
                        const value_split = value.split("#");
                        if (value_split.length > 1) {
                            if (
                                value_split[0] ===
                                "http://www.semwebtech.org/mondial/10/meta"
                            ) {
                                obj[key] = `${prefix_mapping[value_split[0]]}:${
                                    value_split[1]
                                }`;
                            }
                        } else {
                            obj[key] = value;
                        }
                    }

                    if (Object.keys(obj).length === 0) {
                        return null;
                    } else {
                        // console.log("obj: ", obj);
                    }
                    return {
                        id: index,
                        ...obj,
                    };
                })
                .filter((item: any) => {
                    return item !== null;
                })
                .filter((item: any) => {
                    return item.class !== undefined;
                })
                .filter((item: any) => {
                    return !item.class.match(/^node.*$/);
                })
                .filter((item: any) => {
                    if (item.superclass) {
                        return !item.superclass.match(/^node.*$/);
                        // && item.class !== item.superclass
                    } else {
                        return true;
                    }
                });
            setDataSource(data);
        } catch (e) {
            console.log("Error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleQuery();
    }, []);

    return (
        <Grid>
            {dataSource.length > 0 && columns.length > 0 && (
                <Grid container spacing={3} style={{ paddingTop: 20 }}>
                    {/* Chart */}
                    <Grid item xs={12}>
                        <Paper
                            sx={{
                                height: "100vh",
                            }}>
                            <DataGridPro
                                rows={dataSource}
                                columns={columns}
                                pagination
                                rowSpacingType='border'
                                showCellRightBorder
                                rowsPerPageOptions={[100, 200, 1000]}
                                // onRowClick={(params) => {
                                //     fetchStatementsFromRepo(
                                //         (params.row as IRepository)
                                //             .title
                                //     );
                                // }}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {loading && (
                <Backdrop
                    sx={{
                        color: "#fff",
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    open={loading}>
                    <CircularProgress color='inherit' />
                    <div style={{ marginLeft: 20 }}> Loading Schema ... </div>
                </Backdrop>
            )}
        </Grid>
    );
}

export default SchemaPage;
