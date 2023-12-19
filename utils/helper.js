function calculateAverageDifficulty(data) {
    let totalDifficulty = data.reduce(
        (total, item) => total + item.difficulty,
        0
    );
    return totalDifficulty / data.length;
}

module.exports = { calculateAverageDifficulty };
