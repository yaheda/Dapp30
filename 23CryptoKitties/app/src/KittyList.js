import React from "react";

export default ({kitties, uriBase}) => (
  <table>
    <thead>
      <th>Id</th>
      <th>Generation</th>
      <th>Gene A</th>
      <th>Gene B</th>
      <th>Pic</th>
    </thead>
    <tbody>
      {kitties.map(kitty => (
        <tr key={kitty.id}>
          <td>{kitty.id}</td>
          <td>{kitty.generation}</td>
          <td>{kitty.geneA}</td>
          <td>{kitty.geneB}</td>
          <td>
            <img
              src={`${uriBase}/${kitty.id}`}
              style={{width: '50px', height: '50px'}}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
