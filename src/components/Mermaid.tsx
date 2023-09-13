import React, { useEffect } from "react";
import mermaid from "mermaid";




interface Props {
  chart: string;
}
export const Mermaid = ({ chart }: Props) => {
  /*
default - This is the default theme for all diagrams.

neutral - This theme is great for black and white documents that will be printed.

dark - This theme goes well with dark-colored elements or dark-mode.

forest - This theme contains shades of green.

base - This is the only theme that can be modified. Use this theme as the base for customizations.
*/

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "neutral",
      flowchart: {
        htmlLabels: true,
      },
      securityLevel: "loose",
      themeCSS: `g.classGroup rect {
        fill: #282a36;
        stroke: #6272a4;
      } 
      g.classGroup text {
        fill: #f8f8f2;
      }
      g.classGroup line {
        stroke: #f8f8f2;
        stroke-width: 0.5;
      }
      .classLabel .box {
        stroke: #21222c;
        stroke-width: 3;
        fill: #21222c;
        opacity: 1;
      }
      .classLabel .label {
        fill: #f1fa8c;
      }
      .basic .label-container {
        fill: hotpink !important;
      }
      .relation {
        stroke: #ff79c6;
        stroke-width: 1;
      }
      #compositionStart, #compositionEnd {
        fill: #bd93f9;
        stroke: #bd93f9;
        stroke-width: 1;
      }
      #aggregationEnd, #aggregationStart {
        fill: #21222c;
        stroke: #50fa7b;
        stroke-width: 1;
      }
      #dependencyStart, #dependencyEnd {
        fill: #00bcd4;
        stroke: #00bcd4;
        stroke-width: 1;
      } 
      #extensionStart, #extensionEnd {
        fill: #f8f8f2;
        stroke: #f8f8f2;
        stroke-width: 1;
      }`,
      fontFamily: '"Inconsolata", monospace'
    });
    mermaid.contentLoaded();
  }, [chart]);

  return (
    <div className='mermaid'>
      {chart}
    </div>
  );
}

// export default class Mermaid extends React.Component {
//   componentDidMount() {
//     mermaid.contentLoaded();
//   }
//   render() {
//     return <div className="mermaid">{this.props.chart}</div>;
//   }
// }
