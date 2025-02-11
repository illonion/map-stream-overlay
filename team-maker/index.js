const textareaEl = document.getElementById("textarea")
let teams = []
function submit() {
    const textareaElValue = textareaEl.value
    const textareaElValueIndividual = textareaElValue.split("\n")
    for (let i = 0; i < textareaElValueIndividual.length; i++) {
        const textareaElValueIndividualSeparated = textareaElValueIndividual[i].split(",")
        const teamData = {
            "team_name": textareaElValueIndividualSeparated[0].trim(),
            "player1_name": textareaElValueIndividualSeparated[1].trim(),
            "player2_name": textareaElValueIndividualSeparated[2].trim(),
            "player3_name": textareaElValueIndividualSeparated[3].trim(),
            "player4_name": textareaElValueIndividualSeparated[4].trim(),
            "player5_name": textareaElValueIndividualSeparated[5].trim(),
            "player6_name": textareaElValueIndividualSeparated[6].trim(),
            "player7_name": textareaElValueIndividualSeparated[7].trim(),
            "player8_name": textareaElValueIndividualSeparated[8].trim(),
            "player1_id": Number(textareaElValueIndividualSeparated[9]),
            "player2_id": Number(textareaElValueIndividualSeparated[10]),
            "player3_id": Number(textareaElValueIndividualSeparated[11]),
            "player4_id": Number(textareaElValueIndividualSeparated[12]),
            "player5_id": Number(textareaElValueIndividualSeparated[13]),
            "player6_id": Number(textareaElValueIndividualSeparated[14]),
            "player7_id": Number(textareaElValueIndividualSeparated[15]),
            "player8_id": Number(textareaElValueIndividualSeparated[16]),
            "team_icon": textareaElValueIndividualSeparated[17].trim()
        }
        teams.push(teamData)
    }

    const jsonString = JSON.stringify(teams, null, 4);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "teams.json";
    link.click();
}