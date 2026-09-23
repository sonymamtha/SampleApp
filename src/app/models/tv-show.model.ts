export interface CastMember {
  id: number;
  name: string;
  birthday: string;
}

export interface TvShow {
  id: number;
  name: string;
  cast: CastMember[];
}
