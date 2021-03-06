declare type PlaceType = {
    placeId: number;
    name: string;
    description: string;
    url: string;
    builder: string;
    builderId: number;
    isPlayable: boolean;
    reasonProhibited: string;
    universeId: number;
    universeRootPlaceId: number;
    price: number;
    imageToken: string;
};
export declare const GetPlaceFromId: (placeId: number) => [boolean, PlaceType | null];
export {};
