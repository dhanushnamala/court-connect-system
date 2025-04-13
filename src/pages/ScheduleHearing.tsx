const scheduleHearing = async (data) => {
  try {
    const { error } = await supabase.from('hearings').insert(data);
    if (error) throw error;
    toast({ title: "Hearing scheduled successfully" });
  } catch (error) {
    toast({ title: "Error scheduling hearing", description: error.message, variant: "destructive" });
  }
};

<form onSubmit={scheduleHearing}>
  <Input type="datetime-local" {...register("date")} />
  <Select {...register("judge_id")}>
    {judges.map(judge => (
      <option key={judge.id} value={judge.id}>{judge.name}</option>
    ))}
  </Select>
  <Button type="submit">Schedule Hearing</Button>
</form>