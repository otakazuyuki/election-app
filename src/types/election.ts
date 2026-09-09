export type Person={
    id:string;
    name:string;
    kana:string;
    party?:string;
    birthdate?:string;
    gender?:string;
    image?:string;
    websiteUrl?:string;
};

export type PeopleMap=Record<string,Person>;

export type DistrictMapping={
    locationId:string;
    prefecture:string;
    city:string;
    town?:string;
    districts:{
        shuin?:string;
        sanin?:string;
        shigi?:string;
        governor?:string;
        mayor?:string;
    }
};

export type DistrictsData=DistrictMapping[];

export type Candidacy={
    personId:string;
    isIncumbent:boolean;
};

export type ElectionEvent={
    id:string;
    title:string;
    category:"shuin"|"sanin"|"shigi"|"governor"|"mayor";
    voteDate:string;
    races:Record<string,Candidacy[]>;
};

export type ElectionMap=Record<string,ElectionEvent>;