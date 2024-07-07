type DataGetter<Data> = (que: Data[]) => Data | undefined;

class Queue<Data> {
  que: Data[];

  constructor() {
    this.que = [];
  }

  /**
   * Method to move a specific data element to the front of the queue.
   * @param options Object containing either `data` or `getData` function.
   */
  moveFront({ data, getData }: { data?: Data, getData?: DataGetter<Data> }) {
    const elementToMove = data ?? (getData ? getData(this.que) : undefined);
    if (elementToMove) {
      const index = this.que.indexOf(elementToMove);
      if (index !== -1) {
        this.que.splice(index, 1); // Remove the element from its current position
        this.que.unshift(elementToMove); // Add it to the front of the array
      }
    }
  }

  /** Method to add data to the end of the queue. */
  add(data: Data) {
    this.que.push(data);
  }

  /**
   * Method to remove a specific data element from the queue.
   * @param options Object containing either `data` or `getData` function.
   */
  remove({ data, getData }: { data?: Data, getData?: DataGetter<Data> }) {
    const elementToRemove = data ?? (getData ? getData(this.que) : undefined);
    if (elementToRemove) {
      const index = this.que.indexOf(elementToRemove);
      if (index !== -1) {
        this.que.splice(index, 1);
      }
    }
  }

  /**
   * Method to update a specific data element in the queue.
   * @param options Object containing either `data` or `getData` function.
   * @param updateData Partial<Data> containing optional fields to update.
   */
  update({ data, getData }: { data?: Data, getData?: DataGetter<Data> }, updateData?: Partial<Data>) {
    const elementToUpdate = data ?? (getData ? getData(this.que) : undefined);
    if (elementToUpdate && updateData) {
      const index = this.que.indexOf(elementToUpdate);
      if (index !== -1) {
        // Merge existing element with updateData using spread operator
        this.que[index] = { ...this.que[index], ...updateData };
      }
    }
  }
}

export default Queue;
export { DataGetter };
