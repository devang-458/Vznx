import React from 'react'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ReponsiveContainer,
    Legend,
    ResponsiveContainer
} from "recharts"

const CustomPieChart = ({ data, colors }) => {
    return (
        <ResponsiveContainer width="100%" height={325}>
            <PieChart>
                <Pie>{data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}</Pie>
            </PieChart>
        </ResponsiveContainer>
    )
}

export default CustomPieChart