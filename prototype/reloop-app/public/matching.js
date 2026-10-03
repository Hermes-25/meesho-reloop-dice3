export const photoLabel=c=>'A photo of '+c.text.slice(0,300);
export function expandPhotoScores(candidates,scores){const byLabel=new Map(scores.map(x=>[x.label,x.score]));return candidates.map(c=>({id:c.id,score:byLabel.get(photoLabel(c))??0})).sort((a,b)=>b.score-a.score)}
