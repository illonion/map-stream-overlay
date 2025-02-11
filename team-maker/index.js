const textareaEl = document.getElementById("textarea")
let teams = []
function submit() {
    const textareaElValue = textareaEl.value
    const textareaElValueIndividual = textareaElValue.split("\n")
    for (let i = 0; i < textareaElValueIndividual.length; i++) {
        const textareaElValueIndividualSeparated = textareaElValueIndividual[i].split(",")
        const teamData = {
            "team_name": textareaElValueIndividualSeparated[0].trim(),
            "player_names": [
                textareaElValueIndividualSeparated[1].trim(),
                textareaElValueIndividualSeparated[2].trim(),
                textareaElValueIndividualSeparated[3].trim(),
                textareaElValueIndividualSeparated[4].trim(),
                textareaElValueIndividualSeparated[5].trim(),
                textareaElValueIndividualSeparated[6].trim(),
                textareaElValueIndividualSeparated[7].trim(),
                textareaElValueIndividualSeparated[8].trim()],
            "player_ids": [
                Number(textareaElValueIndividualSeparated[9]),
                Number(textareaElValueIndividualSeparated[10]),
                Number(textareaElValueIndividualSeparated[11]),
                Number(textareaElValueIndividualSeparated[12]),
                Number(textareaElValueIndividualSeparated[13]),
                Number(textareaElValueIndividualSeparated[14]),
                Number(textareaElValueIndividualSeparated[15]),
                Number(textareaElValueIndividualSeparated[16]),
            ],
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