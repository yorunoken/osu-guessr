export interface Supporter {
    name: string;
    url?: string;
    amount: number;
    message?: string;
}

export const supporters: Array<Supporter> = [];
