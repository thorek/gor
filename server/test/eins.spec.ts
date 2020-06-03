
describe('Eins', () => {

  const movieData:any = {
    // name: 'Pirates of the caribbean',
    name: "Casablanca",
    rating: 8.5
  }

  it('should do something right', () => {
    expect(8.5).toEqual(movieData.rating)
  })

  it('should do something wrong', () => {
    expect('Casablanca').toEqual(movieData.name)
  })

})
