import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Location } from "@/types";
import { mockLocations } from "@/mocks/locations";

interface LocationsState {
  items: Location[];
  loading: boolean;
}

const initialState: LocationsState = {
  items: mockLocations,
  loading: false,
};

const locationsSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    // Пока просто заглушки — потом заменим на createAsyncThunk с fetch к NestJS
    setLocations(state, action: PayloadAction<Location[]>) {
      state.items = action.payload;
    },
  },
});

export const { setLocations } = locationsSlice.actions;
export default locationsSlice.reducer;
