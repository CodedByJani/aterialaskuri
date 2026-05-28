import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'

export default function AdminLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem("sessionToken")
                const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/logs`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (!response.ok) throw new Error("Virhe haettaessa lokeja")
                
                const data = await response.json()

                const formattedLogs = data.map(log => ({
                    ...log,
                    id: log._id,
                    timestamp: new Date(log.timestamp).toLocaleString("fi-FI", {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                    })
                }))

                setLogs(formattedLogs)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [])

    const columns = [
        { field: 'timestamp', headerName: 'Aika', width: 170 },
        { field: 'email', headerName: 'Käyttäjä', width: 220 },
        {
            field: 'action',
            headerName: 'Toiminto',
            width: 150,
            renderCell: (params) => (
                <span style={{ fontWeight: 600, color: params.value === 'LOGIN' ? '#2563eb' : '#10b981' }}>
                    {params.value}
                </span>
            )
        },
        { field: 'details', headerName: 'Tarkemmat tiedot', flex: 1 }
    ]

    return (
        <div className="app-container">
            <div className="app-header">
                <h1>Tapahtumaloki</h1>
                <button
                    onClick={() => navigate("/")}
                    className="logout-button"
                    style={{ backgroundColor: "#2563eb" }}
                >
                    Takaisin sovellukseen
                </button>
            </div>

            <div className="logs-grid-container" data-testid="logs-grid">
                <DataGrid
                    rows={logs}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    loading={loading}
                    disableRowSelectionOnClick
                    />
            </div>
        </div>
    )
}