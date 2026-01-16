export const generateSparklineData = (baseReturn: number): { month: string; value: number; return: number }[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const points = 12
    const data: { month: string; value: number; return: number }[] = []
    let current = 100

    for (let i = 0; i < points; i++) {
        const randomChange = (Math.random() - 0.4) * 2
        current = current * (1 + randomChange / 100)
        const monthReturn = randomChange * 2
        data.push({
            month: months[i],
            value: current,
            return: monthReturn,
        })
    }

    // Ensure the final value reflects the actual return
    const scaleFactor = (100 + baseReturn) / current
    return data.map((d) => ({
        ...d,
        value: d.value * scaleFactor,
    }))
}

export const generateHeatmapData = (): { month: string; value: number; color: string }[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map((month) => {
        const value = (Math.random() - 0.3) * 20
        let color = "bg-emerald-500/20"
        if (value < -5) color = "bg-red-500/40"
        else if (value < 0) color = "bg-red-500/20"
        else if (value > 5) color = "bg-emerald-500/40"
        return { month, value, color }
    })
}
